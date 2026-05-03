# Plan de Implementación: Inventario → Motor Contable

**Fecha:** 2026-03-01
**Objetivo:** Escalar el módulo de inventario hacia generación automática de asientos
contables, con soporte de préstamos de herramientas y mínima lógica en el backend.

---

## Principios rectores

> **"Todo movimiento es una transferencia entre dos ubicaciones."**

> **"La lógica contable vive en las ubicaciones, no en el tipo de movimiento."**

> **"Los registros no se eliminan ni modifican. Los errores se corrigen con nuevos registros."**

El backend se limita a tres responsabilidades:
1. Mover cantidad de una ubicación a otra — **siempre el mismo código**
2. Registrar el evento con datos económicos completos — **de forma inmutable**
3. Delegar consecuencias (asientos, alertas) a Subscribers — **sin lógica en el servicio**

El campo `tipoMovimiento` es una **etiqueta descriptiva** para la UI y los permisos.
No conduce ninguna lógica de negocio ni contable.

---

## Diagnóstico: Riesgos activos

| # | Riesgo | Impacto | Urgencia |
|---|--------|---------|----------|
| 1 | Race condition en stock — `findOne → calcular → update` sin atomicidad | Stock corrupto en concurrencia | 🔴 Crítico |
| 2 | `punit` se sobreescribe al recibir OC → precio histórico perdido | Asientos incorrectos | 🔴 Crítico |
| 3 | `MovimientoInventario` no guarda valor monetario | Imposible generar asientos históricos | 🔴 Crítico |
| 4 | `create()` hace 4-6 operaciones sin transacción envolvente | Estado parcialmente corrupto ante fallo | 🟠 Alto |
| 5 | Hard delete en movimientos | Historial de auditoría destruido | 🟠 Alto |
| 6 | `tipoMovimiento` string libre sin ENUM en DB | Valores inconsistentes en producción | 🟠 Alto |
| 7 | `stockReservado` calculado en `@AfterLoad()` según relaciones cargadas | Valor inconsistente según el query | 🟡 Medio |
| 8 | `personaId` en movimiento sin semántica de ubicación | Bloquea modelo de préstamos | 🟡 Medio |

---

## Modelo objetivo (estado final del plan)

### Ubicaciones: el corazón del sistema

Las ubicaciones son los nodos del grafo. Todo movimiento es una arista entre dos nodos.
Existen dos categorías:

**Ubicaciones REALES** — tienen stock físico rastreable:
```
almacen_central   (ALMACEN) → cuenta: Mercaderías / Inventario    [activo]
persona_juan      (PERSONA) → cuenta: NULL  ← sin asiento contable
```

**Ubicaciones VIRTUALES** — son extremos conceptuales, no acumulan stock físico:
```
proveedor         (VIRTUAL) → cuenta: Cuentas a Pagar             [pasivo]
produccion        (VIRTUAL) → cuenta: Costo de Producción         [gasto]
ajuste            (VIRTUAL) → cuenta: Ajuste de Inventario        [resultado]
```

Las ubicaciones virtuales no tienen `stock_ubicacion`. Cuando el stock "entra" al sistema,
viene de `proveedor`. Cuando se "consume", va a `produccion`. Cuando se ajusta, va/viene
de `ajuste`. Las ubicaciones PERSONA sí tienen stock — el activo sigue en el patrimonio,
solo cambió de custodio.

### La regla contable universal

```
DEBE:  ubicacion_destino.cuenta_contable_id  ×  valor_total
HABER: ubicacion_origen.cuenta_contable_id   ×  valor_total

Si alguna cuenta es NULL → no generar asiento
```

Eso es todo. El Subscriber no tiene ningún `if`. Todos los casos quedan cubiertos:

| Operación | Origen | Destino | DEBE | HABER |
|---|---|---|---|---|
| Recibir compra | proveedor | almacen_central | Mercaderías | Ctas. a Pagar |
| Consumir en OT | almacen_central | produccion | Costo de Prod. | Mercaderías |
| Ajuste positivo | ajuste | almacen_central | Mercaderías | Ajuste Inv. |
| Ajuste negativo / baja | almacen_central | ajuste | Ajuste Inv. | Mercaderías |
| Préstamo herramienta | almacen_central | persona_juan **(NULL)** | — sin asiento — | |
| Devolución herramienta | persona_juan **(NULL)** | almacen_central | — sin asiento — | |

---

## Estrategia de transición: coexistencia sin big bang

El problema real es que hoy hay miles de movimientos sin `ubicacion_origen_id` /
`ubicacion_destino_id`. No se pueden migrar de golpe. La estrategia es:

1. Las columnas de ubicación se agregan como **nullable** — compatibilidad total con datos existentes
2. `inventario.stock` se mantiene como **caché del almacén central** — el frontend no cambia
3. `stock_ubicacion` se crea en paralelo y se sincroniza con los movimientos nuevos
4. El servicio tiene **dos caminos**:
   - Movimiento **con ubicaciones** → lógica nueva (genérica, sin ifs)
   - Movimiento **sin ubicaciones** → lógica vieja (fallback temporal, se elimina gradualmente)
5. El Subscriber **solo actúa** cuando el movimiento tiene ambas ubicaciones con cuenta contable
6. El historial pre-migración no genera asientos — es legado; los reportes contables parten del período post-activación

---

## Fases de implementación

---

### FASE 1 — Correctitud: Atomicidad y Registros Inmutables
**Prioridad:** 🔴 Implementar primero — no bloquea a nadie, solo corrige
**SQL:** Sin cambios de esquema
**Afecta:** `movimiento-inventario.service.ts`, `movimiento-inventario.controller.ts`

#### 1.1 Transacción atómica con delta en lugar de read-modify-write

```typescript
// ANTES — race condition activa:
const producto = await this.inventarioRepository.findOne({ where: { id } })
const nuevoStock = producto.stock + delta          // otro request leyó el mismo valor
await this.inventarioRepository.update({ id }, { stock: nuevoStock })

// DESPUÉS — atómico, sin race condition:
await this.dataSource.transaction(async (manager) => {
  // El UPDATE en sí calcula el nuevo valor — base de datos lo garantiza
  await manager.query(
    `UPDATE inventario SET stock = stock + ? WHERE inventarioId = ?`,
    [delta, productoId]   // delta es negativo para salidas
  )
  await manager.save(MovimientoInventario, movimiento)
  // Todas las operaciones secundarias dentro del mismo manager
})
```

#### 1.2 Eliminar DELETE — reemplazar por reversión

Los movimientos son registros inmutables. No se borran nunca, ni con soft delete.
Un error se corrige creando un movimiento compensatorio con origen/destino invertidos.

```typescript
// ELIMINAR: método remove() y endpoint DELETE /movimiento-inventario/:id

// AGREGAR: endpoint POST /movimiento-inventario/:id/revertir
async revertir(id: number, motivo: string) {
  await this.dataSource.transaction(async (manager) => {
    const original = await manager.findOneOrFail(MovimientoInventario, { where: { id } })

    await manager.save(MovimientoInventario, {
      tipoMovimiento:    original.tipoMovimiento,
      productoId:        original.productoId,
      cantidad:          original.cantidad,
      valorUnitario:     original.valorUnitario,
      valorTotal:        original.valorTotal,
      ubicacionOrigenId:  original.ubicacionDestinoId,  // invertidos
      ubicacionDestinoId: original.ubicacionOrigenId,   // invertidos
      motivo:  `REVERSIÓN: ${motivo}`,
      origen:  `reversion:${original.id}`,
    })
    // El delta inverso corrige el stock en la misma transacción
    // El Subscriber genera el asiento de cancelación automáticamente
  })
}
```

El asiento del movimiento original **nunca se toca**. El movimiento compensatorio
genera su propio asiento con las cuentas invertidas.

---

### FASE 2 — Integridad de datos: Valor Monetario y Tipo de Item
**Prioridad:** 🔴 Implementar junto con Fase 1
**SQL:** `85.sql`

#### 2.1 ENUM `tipo_movimiento` — formalizar los valores existentes

```sql
-- 85.sql
ALTER TABLE movimiento_inventario
  MODIFY COLUMN tipo_movimiento
  ENUM('IN','OUT','AJUSTE','TRANSFERENCIA','RESERVA') NOT NULL
  COMMENT 'Etiqueta descriptiva para UI y permisos. No conduce lógica de negocio.';
```

```typescript
// constants/inventario.ts
export const TIPO_MOVIMIENTO = {
  IN:            'IN',            // etiqueta: entrada desde proveedor
  OUT:           'OUT',           // etiqueta: consumo en OT (consumibles y herramientas)
  AJUSTE:        'AJUSTE',        // etiqueta: corrección, baja, merma
  TRANSFERENCIA: 'TRANSFERENCIA', // etiqueta: préstamo, devolución, traslado
  RESERVA:       'RESERVA',       // etiqueta: reserva para presupuesto
} as const
```

> La diferencia entre consumo de consumible y baja de herramienta no es el tipo —
> ambos son `OUT`. La diferencia contable la determina el destino (`produccion` vs `ajuste`)
> y el motivo describe la causa ("Baja por rotura de taladro").

#### 2.2 Agregar valor monetario al movimiento

```sql
-- 85.sql (continuación)
ALTER TABLE movimiento_inventario
  ADD COLUMN valor_unitario DECIMAL(15,4) NULL
    COMMENT 'Precio unitario en el momento del movimiento — inmutable',
  ADD COLUMN valor_total DECIMAL(15,4) NULL
    COMMENT 'cantidad × valor_unitario';
```

El `valor_unitario` se captura de `inventario.punit` **en el momento** del movimiento.
Una vez guardado, nunca se modifica. Es la foto del precio en ese instante.

#### 2.3 Dejar de sobreescribir `punit` al recibir una OC

```typescript
// ELIMINAR este comportamiento de actualizarPrecioUnitario():
// await this.inventarioRepository.update({ id: productoId }, { punit: X })

// punit en inventario = precio de lista actualizable manualmente
// valor_unitario en movimiento = precio histórico en el momento del evento
```

#### 2.4 Agregar `tipo_item` a inventario

```sql
-- 85.sql (continuación)
ALTER TABLE inventario
  ADD COLUMN tipo_item ENUM('consumible','herramienta') NOT NULL DEFAULT 'consumible'
    COMMENT 'consumible: se agota al usar. herramienta: se presta y devuelve.';
```

Permite diferenciar el comportamiento en la UI (qué operaciones están habilitadas)
y en reportes (cuánto se consumió vs cuánto está prestado).

---

### FASE 3 — Ubicaciones: Infraestructura Base
**Prioridad:** 🟠 Implementar antes de activar préstamos
**SQL:** `86.sql`

#### 3.1 Tabla `ubicacion_inventario`

```sql
-- 86.sql
CREATE TABLE ubicacion_inventario (
  id                 INT AUTO_INCREMENT PRIMARY KEY,
  tipo               ENUM('ALMACEN','PERSONA','VIRTUAL') NOT NULL,
  nombre             VARCHAR(100) NOT NULL,
  persona_id         INT NULL     COMMENT 'Solo para tipo=PERSONA',
  cuenta_contable_id INT NULL     COMMENT 'NULL = sin asiento contable para esta ubicación',
  activo             BOOLEAN NOT NULL DEFAULT TRUE,
  created_at         DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at         DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (persona_id)         REFERENCES persona(personaId),
  FOREIGN KEY (cuenta_contable_id) REFERENCES cuenta_contable(id)
);

-- Ubicaciones del sistema — NO BORRAR
-- Las cuentas contables se asignan según el plan de cuentas de la empresa
INSERT INTO ubicacion_inventario (tipo, nombre, cuenta_contable_id) VALUES
  ('ALMACEN',  'Almacén Central',        NULL),  -- asignar: cuenta Mercaderías
  ('VIRTUAL',  'Proveedor / Externo',    NULL),  -- asignar: cuenta Cuentas a Pagar
  ('VIRTUAL',  'Producción / Consumo',   NULL),  -- asignar: cuenta Costo de Producción
  ('VIRTUAL',  'Ajuste de Inventario',   NULL);  -- asignar: cuenta Ajuste de Inventario
-- Las ubicaciones PERSONA se crean automáticamente en el primer préstamo
```

**Sobre los tipos:**
- `ALMACEN` — stock físico real. Tiene entradas en `stock_ubicacion`.
- `PERSONA` — stock en custodia. Tiene entradas en `stock_ubicacion`. Sin cuenta contable (el activo sigue en la empresa).
- `VIRTUAL` — extremo conceptual. No tiene entradas en `stock_ubicacion`. Tiene cuenta contable para disparar el asiento.

#### 3.2 Tabla `stock_ubicacion`

Solo para ubicaciones ALMACEN y PERSONA. Las ubicaciones VIRTUAL no acumulan stock.

```sql
-- 86.sql (continuación)
CREATE TABLE stock_ubicacion (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  inventario_id INT NOT NULL,
  ubicacion_id  INT NOT NULL,
  cantidad      DECIMAL(15,4) NOT NULL DEFAULT 0,
  updated_at    DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_inv_ubi (inventario_id, ubicacion_id),
  FOREIGN KEY (inventario_id) REFERENCES inventario(inventarioId),
  FOREIGN KEY (ubicacion_id)  REFERENCES ubicacion_inventario(id)
);

-- Migrar stock actual al Almacén Central (id=1)
INSERT INTO stock_ubicacion (inventario_id, ubicacion_id, cantidad)
SELECT inventarioId, 1, stock
FROM inventario
WHERE manejaStock = TRUE AND stock > 0;
```

#### 3.3 Columnas de ubicación en movimiento — nullable para retrocompatibilidad

```sql
-- 86.sql (continuación)
ALTER TABLE movimiento_inventario
  ADD COLUMN ubicacion_origen_id  INT NULL
    COMMENT 'NULL en movimientos históricos pre-migración',
  ADD COLUMN ubicacion_destino_id INT NULL
    COMMENT 'NULL en movimientos históricos pre-migración',
  ADD FOREIGN KEY (ubicacion_origen_id)  REFERENCES ubicacion_inventario(id),
  ADD FOREIGN KEY (ubicacion_destino_id) REFERENCES ubicacion_inventario(id);
```

#### 3.4 `inventario.stock` como caché del almacén central

La columna `inventario.stock` **se mantiene** y se sigue actualizando en cada movimiento.
Sirve como lectura rápida sin necesidad de hacer JOIN con `stock_ubicacion`.
Semánticamente representa el stock en el almacén central (ubicaciones ALMACEN).

El stock en ubicaciones PERSONA (herramientas prestadas) **no se refleja en `inventario.stock`**.
Eso es intencional: el stock "disponible" es lo que está en el almacén.

```
inventario.stock  =  SUM(stock_ubicacion WHERE ubicacion.tipo = 'ALMACEN')
                  →  se mantiene sincronizado en la transacción del movimiento
```

#### 3.5 Creación automática de ubicación PERSONA

Cuando se hace el primer préstamo a una persona que no tiene ubicación:

```typescript
async obtenerOCrearUbicacionPersona(
  personaId: number,
  manager: EntityManager
): Promise<UbicacionInventario> {
  let ubicacion = await manager.findOne(UbicacionInventario, {
    where: { tipo: 'PERSONA', personaId }
  })
  if (!ubicacion) {
    const persona = await manager.findOne(Persona, { where: { id: personaId } })
    ubicacion = await manager.save(UbicacionInventario, {
      tipo: 'PERSONA',
      personaId,
      nombre: persona?.nombre ?? `Persona #${personaId}`,
      cuentaContableId: null,  // sin asiento para herramientas en custodia
    })
  }
  return ubicacion
}
```

---

### FASE 4 — Servicio Unificado: Un Solo Código para Todo
**Prioridad:** 🟠 Implementar junto con Fase 3
**Depende de:** Fase 3

**Objetivo:** El servicio deja de tener lógica por tipo de movimiento.
Hay un único camino para todos los movimientos que tengan ubicaciones.
El camino viejo queda como fallback temporal.

#### 4.1 La lógica nueva — genérica, sin ifs por tipo

```typescript
async create(dto: CreateMovimientoInventarioDto) {
  return await this.dataSource.transaction(async (manager) => {

    // ── Camino nuevo: movimiento con ubicaciones ──────────────────────────────
    if (dto.ubicacionOrigenId && dto.ubicacionDestinoId) {
      return await this.transferirEntreUbicaciones(dto, manager)
    }

    // ── Camino viejo: fallback para compatibilidad con frontend sin ubicaciones
    // Se elimina gradualmente a medida que el frontend se actualiza
    return await this.crearMovimientoLegado(dto, manager)
  })
}

private async transferirEntreUbicaciones(
  dto: CreateMovimientoInventarioDto,
  manager: EntityManager
) {
  const producto = await manager.findOneOrFail(Inventario, {
    where: { id: dto.productoId }
  })

  const valorUnitario = dto.valorUnitario ?? Number(producto.punit)
  const valorTotal    = valorUnitario * Number(dto.cantidad)

  // Validar stock suficiente en origen (solo ubicaciones que acumulan stock)
  const origen = await manager.findOneOrFail(UbicacionInventario, {
    where: { id: dto.ubicacionOrigenId }
  })
  if (origen.tipo !== 'VIRTUAL') {
    const stockOrigen = await manager.findOne(StockUbicacion, {
      where: { inventarioId: dto.productoId, ubicacionId: dto.ubicacionOrigenId }
    })
    const cantidadActual = Number(stockOrigen?.cantidad ?? 0)
    if (cantidadActual < Number(dto.cantidad)) {
      throw new Error(`Stock insuficiente en "${origen.nombre}": ${cantidadActual} disponibles`)
    }
  }

  // Reducir en origen (solo si es ALMACEN o PERSONA)
  if (origen.tipo !== 'VIRTUAL') {
    await manager.query(
      `UPDATE stock_ubicacion SET cantidad = cantidad - ?
       WHERE inventario_id = ? AND ubicacion_id = ?`,
      [dto.cantidad, dto.productoId, dto.ubicacionOrigenId]
    )
  }

  // Aumentar en destino (solo si es ALMACEN o PERSONA)
  const destino = await manager.findOneOrFail(UbicacionInventario, {
    where: { id: dto.ubicacionDestinoId }
  })
  if (destino.tipo !== 'VIRTUAL') {
    await manager.query(
      `INSERT INTO stock_ubicacion (inventario_id, ubicacion_id, cantidad)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE cantidad = cantidad + VALUES(cantidad)`,
      [dto.productoId, dto.ubicacionDestinoId, dto.cantidad]
    )
  }

  // Sincronizar inventario.stock con el stock del almacén central
  if (origen.tipo === 'ALMACEN' || destino.tipo === 'ALMACEN') {
    const delta = destino.tipo === 'ALMACEN'
      ? Number(dto.cantidad)
      : -Number(dto.cantidad)
    await manager.query(
      `UPDATE inventario SET stock = stock + ? WHERE inventarioId = ?`,
      [delta, dto.productoId]
    )
  }

  // Guardar movimiento — el Subscriber genera el asiento si corresponde
  return await manager.save(MovimientoInventario, {
    ...dto,
    valorUnitario,
    valorTotal,
  })
}
```

#### 4.2 Préstamos — flujo completo

```
// Préstamo de taladro a Juan:
POST /movimiento-inventario
{
  tipoMovimiento:    "TRANSFERENCIA",
  productoId:        42,
  ubicacionOrigenId: 1,     // Almacén Central
  personaDestinoId:  15,    // → el servicio busca/crea ubicacion PERSONA para Juan
  cantidad:          1,
  motivo:            "Préstamo OT #234"
}

// Devolución:
POST /movimiento-inventario
{
  tipoMovimiento:     "TRANSFERENCIA",
  productoId:         42,
  ubicacionOrigenId:  <id_ubicacion_juan>,
  ubicacionDestinoId: 1,    // vuelve al Almacén Central
  cantidad:           1,
  motivo:             "Devolución OT #234"
}
```

**Préstamos activos** = movimientos TRANSFERENCIA donde `destino.tipo = PERSONA`
sin una TRANSFERENCIA inversa posterior para el mismo producto y persona.

---

### FASE 5 — Asientos Contables Automáticos
**Prioridad:** 🟡 Implementar cuando se requiera contabilidad formal
**SQL:** `87.sql`
**Depende de:** Fase 3

#### 5.1 Tablas contables

```sql
-- 87.sql
CREATE TABLE asiento_contable (
  id                       INT AUTO_INCREMENT PRIMARY KEY,
  movimiento_inventario_id INT NULL
    COMMENT 'Si fue generado por un movimiento de inventario',
  asiento_revertido_id     INT NULL
    COMMENT 'Si este asiento cancela a otro, referencia al original',
  fecha                    DATE NOT NULL,
  descripcion              VARCHAR(200) NOT NULL,
  estado                   ENUM('borrador','confirmado') NOT NULL DEFAULT 'borrador',
  tipo_origen              VARCHAR(50) NULL
    COMMENT 'movimiento_inventario | factura | manual | ...',
  created_at               DATETIME DEFAULT CURRENT_TIMESTAMP,
  -- Sin updated_at ni deleted_at: los asientos son inmutables
  FOREIGN KEY (movimiento_inventario_id) REFERENCES movimiento_inventario(id),
  FOREIGN KEY (asiento_revertido_id)     REFERENCES asiento_contable(id)
);

CREATE TABLE linea_asiento (
  id                  INT AUTO_INCREMENT PRIMARY KEY,
  asiento_contable_id INT NOT NULL,
  cuenta_contable_id  INT NOT NULL,
  debe                DECIMAL(15,4) NOT NULL DEFAULT 0,
  haber               DECIMAL(15,4) NOT NULL DEFAULT 0,
  descripcion         VARCHAR(200) NULL,
  centro_costo_id     INT NULL,
  FOREIGN KEY (asiento_contable_id) REFERENCES asiento_contable(id),
  FOREIGN KEY (cuenta_contable_id)  REFERENCES cuenta_contable(id),
  FOREIGN KEY (centro_costo_id)     REFERENCES centro_costo(id),
  CONSTRAINT chk_balance CHECK (debe >= 0 AND haber >= 0)
);
```

#### 5.2 Subscriber — sin lógica de negocio

```typescript
// subscribers/movimiento-inventario.subscriber.ts
@EventSubscriber()
export class MovimientoInventarioSubscriber
  implements EntitySubscriberInterface<MovimientoInventario> {

  listenTo() { return MovimientoInventario }

  async afterInsert(event: InsertEvent<MovimientoInventario>) {
    const mov = event.entity

    // Solo actuar en movimientos con ubicaciones (post-migración)
    if (!mov.ubicacionOrigenId || !mov.ubicacionDestinoId) return
    if (!mov.valorTotal || Number(mov.valorTotal) === 0) return

    const origen  = await event.manager.findOne(UbicacionInventario, {
      where: { id: mov.ubicacionOrigenId }
    })
    const destino = await event.manager.findOne(UbicacionInventario, {
      where: { id: mov.ubicacionDestinoId }
    })

    // Si alguna ubicación no tiene cuenta → sin asiento (ej: PERSONA)
    if (!origen?.cuentaContableId || !destino?.cuentaContableId) return

    const valor = Number(mov.valorTotal)
    const lineas = [
      { cuentaContableId: destino.cuentaContableId, debe: valor, haber: 0     },
      { cuentaContableId: origen.cuentaContableId,  debe: 0,     haber: valor },
    ]

    // Doble entrada — invariante antes de persistir
    const totalDebe  = lineas.reduce((s, l) => s + l.debe, 0)
    const totalHaber = lineas.reduce((s, l) => s + l.haber, 0)
    if (Math.abs(totalDebe - totalHaber) > 0.001) {
      throw new Error(`Asiento no balanceado: debe=${totalDebe} haber=${totalHaber}`)
    }

    await event.manager.save(AsientoContable, {
      movimientoInventarioId: mov.id,
      fecha:       mov.fecha,
      descripcion: `${mov.tipoMovimiento} — ${mov.motivo}`,
      estado:      'borrador',
      lineas,
    })
  }
}
```

> Agregar un nuevo tipo de flujo (devolución a proveedor, consignación) = crear la
> ubicación con su cuenta contable. Sin tocar ninguna línea de código del Subscriber.

---

### FASE 6 — Módulo Contable Completo
**Prioridad:** ⚪ Largo plazo — cuando los asientos estén validados en producción

- **Libro Diario**: todos los asientos en orden cronológico
- **Mayor Contable**: movimientos por cuenta con saldo acumulado
- **Balance de Sumas y Saldos**: generado a partir de asientos confirmados
- **Cierre de Período**: confirmar asientos del período, bloquear modificaciones retroactivas
- **Conciliación**: relacionar asientos de inventario con facturas de compra/venta
- **Exportación AFIP**: formato requerido para reportes fiscales (ya existe `afip-api`)

---

## Reglas de negocio — no violar

1. **Los movimientos son inmutables.** No existe `DELETE` ni `UPDATE` sobre un movimiento registrado. Sin excepciones, ni siquiera soft delete.

2. **Los errores se corrigen con reversiones.** Un movimiento incorrecto genera un movimiento compensatorio con origen/destino invertidos. El stock y el asiento quedan compensados. El historial queda completo.

3. **Los asientos son inmutables.** `asiento_contable` no tiene `updated_at` ni `deleted_at`. Para cancelar un asiento se crea uno nuevo con `asiento_revertido_id` apuntando al original. El libro diario siempre muestra ambos.

4. **El `valor_unitario` se captura al momento del movimiento.** Es la foto del precio en ese instante. No se modifica nunca, aunque `punit` del producto cambie después.

5. **`inventario.stock` es el stock del almacén central.** El stock prestado a personas no se refleja ahí. `stock_ubicacion` es la fuente de detalle por ubicación.

6. **Las ubicaciones VIRTUAL no acumulan stock.** No tienen entradas en `stock_ubicacion`. Son extremos contables: de dónde viene el stock (proveedor) o adónde va (produccion, ajuste).

7. **Las ubicaciones PERSONA no generan asiento.** El activo sigue en el patrimonio de la empresa. Solo cambió de custodio.

8. **El stock en origen no puede quedar negativo** (para ubicaciones ALMACEN/PERSONA). Se valida dentro de la transacción antes de ejecutar el movimiento.

9. **Doble entrada siempre verificada.** `SUM(debe) = SUM(haber)` es un invariante verificado en el Subscriber antes de persistir. Si no balancean, se lanza excepción y nada se guarda.

---

## Resumen de cambios por archivo

### Archivos a modificar

| Archivo | Fase | Cambio principal |
|---|---|---|
| `movimiento-inventario.service.ts` | 1, 2, 4 | Transacción atómica, eliminar remove(), camino nuevo con ubicaciones, fallback legado |
| `movimiento-inventario.controller.ts` | 1 | Eliminar endpoint DELETE, agregar POST /:id/revertir |
| `movimiento-inventario.entity.ts` | 2, 3 | Agregar valorUnitario, valorTotal, ubicacionOrigenId, ubicacionDestinoId |
| `create-movimiento-inventario.dto.ts` | 2, 3 | Agregar @IsEnum, valorUnitario, ubicacionOrigenId, personaDestinoId |
| `movimiento-inventario.module.ts` | 3 | Agregar UbicacionInventario, StockUbicacion |
| `inventario.entity.ts` | 2 | Agregar tipoItem |
| `constants/inventario.ts` | 2 | Formalizar ENUM, agregar TRANSFERENCIA |

### Archivos nuevos

| Archivo | Fase | Descripción |
|---|---|---|
| `ubicacion-inventario/` | 3 | Módulo: entity, service, controller |
| `stock-ubicacion/` | 3 | Módulo: entity, service |
| `asiento-contable/` | 5 | Módulo: AsientoContable + LineaAsiento + service |
| `subscribers/movimiento-inventario.subscriber.ts` | 5 | Generación automática de asientos |

### Migraciones SQL

| Archivo | Fase | Contenido |
|---|---|---|
| `85.sql` | 1+2 | ENUM tipo_movimiento, valor_unitario, valor_total, tipo_item |
| `86.sql` | 3 | ubicacion_inventario, stock_ubicacion, columnas nullable en movimiento |
| `87.sql` | 5 | asiento_contable, linea_asiento |

---

## Orden de implementación

```
HOY
  Fase 1 + 2  →  Transacción atómica, inmutabilidad, valor monetario, tipo_item
       │
  Fase 3 + 4  →  Ubicaciones + servicio unificado (antes de activar préstamos)
       │
  Fase 5      →  Asientos automáticos (cuando se requiera contabilidad formal)
       │
  Fase 6      →  Módulo contable completo (largo plazo)
```

Cada fase es desplegable de forma independiente.
El sistema es funcional y correcto en cualquier punto intermedio.
