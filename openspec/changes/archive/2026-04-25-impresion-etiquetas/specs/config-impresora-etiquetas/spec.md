## ADDED Requirements

### Requirement: Configurar dimensiones de etiqueta por máquina
El sistema SHALL permitir configurar el ancho y alto de la etiqueta en milímetros. Esta configuración SHALL persistirse en `localStorage` bajo la clave `etiqueta_config` y aplicarse a todas las impresiones realizadas desde esa máquina. Los valores por defecto SHALL ser ancho=50mm, alto=30mm.

#### Scenario: Guardar dimensiones personalizadas
- **WHEN** el operador ingresa ancho=40 y alto=25 en la configuración y guarda
- **THEN** la configuración se persiste en localStorage y el preview actualiza a esas dimensiones

#### Scenario: Dimensiones aplicadas en impresión
- **WHEN** el operador imprime etiquetas desde cualquier flujo
- **THEN** las etiquetas usan las dimensiones configuradas en localStorage de esa máquina

#### Scenario: Configuración aislada por máquina
- **WHEN** el mismo usuario accede desde dos PCs distintas
- **THEN** cada PC usa su propia configuración de dimensiones independientemente

---

### Requirement: Configurar campos visibles en la etiqueta
El sistema SHALL permitir seleccionar qué campos aparecen en la etiqueta mediante toggles. Los campos configurables SHALL ser: título del artículo, talle, color, código de barras, precio, SKU. Los campos activos por defecto SHALL ser: título del artículo, talle, color, código de barras.

#### Scenario: Desactivar campo código de barras
- **WHEN** el operador desactiva el campo "Código de barras" en la configuración
- **THEN** el preview muestra la etiqueta sin barcode y las impresiones no incluyen barcode

#### Scenario: Activar campo precio
- **WHEN** el operador activa el campo "Precio"
- **THEN** el preview muestra el precio en la etiqueta

#### Scenario: Preview refleja cambios en tiempo real
- **WHEN** el operador activa o desactiva cualquier campo
- **THEN** el preview de la etiqueta se actualiza inmediatamente sin necesidad de guardar

---

### Requirement: Configurar modo de impresión
El sistema SHALL permitir elegir entre dos modos de impresión: "Web Serial" (directo al USB, sin diálogo) y "Sistema" (window.print(), con diálogo del OS). El modo por defecto SHALL ser "Sistema". En modo Web Serial, el sistema SHALL exponer un botón "Conectar impresora" que abre el selector de dispositivos USB de Chrome y persiste la selección.

#### Scenario: Seleccionar modo Web Serial
- **WHEN** el operador selecciona "Web Serial" y hace click en "Conectar impresora"
- **THEN** Chrome muestra el selector de puertos serie USB; al seleccionar la Zebra, la conexión queda guardada para futuras impresiones sin necesidad de volver a seleccionar

#### Scenario: Modo Web Serial no disponible en el browser
- **WHEN** el operador accede a la configuración desde un browser que no soporta Web Serial API
- **THEN** la opción "Web Serial" aparece deshabilitada con el mensaje "Requiere Chrome 89+"

#### Scenario: Modo Sistema como fallback
- **WHEN** el operador selecciona modo "Sistema"
- **THEN** al imprimir se abre el diálogo nativo del OS donde puede seleccionar la Zebra
