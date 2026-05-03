## Context

El sistema actual no tiene mecanismo para registrar el tráfico de personas en el local. Solo existen movimientos de inventario que registran ventas, pero sin la contraparte de "cuántas personas entraron y no compraron". Esto hace imposible medir conversión, entender el perfil del visitante o analizar las barreras de venta.

El módulo `movimiento-inventario` existente cubre el caso de "venta" (ubicacion → cliente). Este diseño se apoya en él en lugar de reemplazarlo.

## Goals / Non-Goals

**Goals:**
- Registrar entradas al local con tipo de visitante y características físicas opcionales
- Capturar el resultado de cada visita: compra (vinculada a un movimiento) o no compra (con razón estructurada)
- Garantizar el invariante: entradas = compras + no_compras (sin visitas "perdidas")
- Proveer dashboard de conversión con análisis por período y por perfil de visitante
- Permitir configurar características de visitante y razones de no compra sin deploy

**Non-Goals:**
- Tracking de visitantes recurrentes / fidelización (el cliente es opcional, no el foco)
- Integración con cámaras o contadores automáticos
- CRM o seguimiento post-visita
- Modificación o eliminación de visitas ya registradas

## Decisions

### 1. Tipos de visitante estáticos en código

**Decisión**: MUJER, HOMBRE, ADULTO_MAYOR, JOVEN, PAREJA, FAMILIA, GRUPO son un enum hardcodeado con avatares SVG definidos en el frontend.

**Alternativa descartada**: tabla configurable igual que las características.

**Razón**: Los tipos son categorías universales del negocio que no cambian. Hardcodearlos permite asignar avatares ilustrativos sin necesidad de UI de subida de imágenes. Las características (gordo/flaco/alto/etc.) sí varían por negocio y van a tabla.

---

### 2. Visita con estado PENDIENTE como mecanismo de invariante

**Decisión**: El click "+1 entró alguien" crea una `visita` con `estado = PENDIENTE`. La UI muestra todas las pendientes y exige resolverlas (COMPRA o NO_COMPRA).

**Alternativa descartada**: contador separado de entradas + registros de resultados independientes (sin link).

**Razón**: Un contador suelto y registros de resultados separados permiten divergencias. El estado PENDIENTE hace el invariante explícito y auditable en BD. La UI puede mostrar pendientes en tiempo real y alertar si hay visitas sin resolver.

---

### 3. Tipos de visitante aplican al grupo, no a individuos

**Decisión**: Una pareja o familia = 1 visita con tipo PAREJA/FAMILIA. No se desglosa por integrante.

**Razón**: El objetivo es medir unidades de compra (grupos que deciden juntos), no personas físicas. Desagregar una pareja en 2 visitas distorsionaría la tasa de conversión.

---

### 4. Una sola razón de no compra por visita

**Decisión**: `visita` tiene un único `razon_id` + `sub_razon_id`. No hay tabla intermedia de múltiples razones.

**Alternativa descartada**: relación N:M visita ↔ razón.

**Razón**: En la práctica el empleado elige la razón principal. Forzar una sola simplifica la UI y el análisis. El campo `observaciones` cubre los casos edge con múltiples factores.

---

### 5. Artículo del catálogo como referencia opcional en la no-compra

**Decisión**: `visita.articulo_id` es nullable y apunta a `articulo` (no a `articulo_variante`).

**Razón**: El visitante preguntó por "un pijama" o "una campera de cuero", no necesariamente por una variante específica. Apuntar al artículo es suficiente para el análisis. `observaciones` cubre artículos fuera del catálogo.

---

### 6. vinculación con movimiento-inventario vía visita_id

**Decisión**: Se agrega campo `visita_id` nullable a `movimiento_inventario`. Cuando se crea un movimiento desde el flujo de visitas, se populea automáticamente.

**Alternativa descartada**: tabla intermedia visita_movimiento.

**Razón**: Es una relación 1:1 (una compra = un movimiento). Campo directo es más simple y performante para el join en el dashboard.

---

### 7. Características como junction table

**Decisión**: `visita_caracteristica` con (visita_id, caracteristica_id). Multi-selección libre.

**Razón**: Un visitante puede tener múltiples características simultáneas (alto + morocho + musculoso). Array en columna no permite joins ni filtros eficientes en el dashboard.

## Risks / Trade-offs

- **[Riesgo] Visitas PENDIENTE acumuladas** → si el local está ocupado y el empleado no resuelve → Mitigación: la pantalla de registro muestra el contador de pendientes de forma prominente y alerta visual si hay más de N sin resolver.

- **[Riesgo] Sesgo en los datos**: si el empleado no registra todas las entradas, la tasa de conversión queda inflada → Mitigación: el sistema no puede forzar esto; es un proceso operativo. El dashboard puede mostrar la brecha entre movimientos de venta y visitas registradas como señal de alerta.

- **[Trade-off] visita_id en movimiento_inventario**: agrega un campo al modelo existente. Los movimientos creados fuera del flujo de visitas tendrán `visita_id = null`, lo cual es válido y esperado.

## Migration Plan

1. Migración SQL: crear tablas nuevas + campo `visita_id` en `movimiento_inventario`
2. Seed: insertar razones de no compra iniciales (Falta de stock, Precio, Forma de pago, Solo miró) con sus sub-razones
3. Deploy backend: nuevos módulos sin breaking changes en los existentes
4. Deploy frontend: nuevas páginas, sin modificar flujos existentes
5. Rollback: el campo `visita_id` en `movimiento_inventario` es nullable → no hay impacto si se revierte

## Open Questions

- ¿Los iconos de `caracteristica_visitante` son emojis, nombres de íconos Lucide, o un set custom? (Impacta el campo `icono VARCHAR(100)` y la UI del selector)
- ¿El dashboard de conversión reemplaza o convive con el `/dashboard` existente?
