export type ChangelogEntryType = 'new' | 'improved' | 'fixed';

export type ChangelogChange = {
    type: ChangelogEntryType;
    text: string;
};

export type ChangelogEntry = {
    date: string;
    changes: ChangelogChange[];
};

export const CHANGELOG_DATA: ChangelogEntry[] = [
    {
        date: '22 de abril, 2026',
        changes: [
            { type: 'new', text: 'Se agrega módulo de ventas con carga de artículos, descuentos, recargos e IVA' },
            { type: 'new', text: 'Se agrega confirmación y anulación de ventas con movimiento automático de stock' },
            { type: 'new', text: 'Se agrega emisión de comprobantes fiscales (integración ARCA/WSFE) y manuales' },
            { type: 'new', text: 'Se agrega impresión de comprobantes en formato A4 y térmica (80mm)' },
            { type: 'new', text: 'Se agrega gestión de vendedores en Configuración' },
            { type: 'new', text: 'Se agrega gestión de métodos de pago con cuotas e intereses configurables' },
            { type: 'new', text: 'Se agrega soporte de múltiples formas de pago por venta con cálculo de saldo' },
            { type: 'improved', text: 'Se amplía el formulario de clientes con datos fiscales: CUIT, condición IVA, domicilio' },
            { type: 'improved', text: 'Se agrega consulta automática al padrón AFIP al ingresar el CUIT de un cliente' },
            { type: 'improved', text: 'Se agrega campo de alícuota IVA (21% por defecto) en artículos' },
        ],
    },
    {
        date: '21 de abril, 2026',
        changes: [
            { type: 'new', text: 'Se agrega dashboard de artículos ancla con semáforo de stock (crítico, atención, normal)' },
            { type: 'new', text: 'Se agrega gestión de umbrales de stock (mínimo, seguridad, máximo) por variante de artículo' },
            { type: 'new', text: 'Se agrega sección Precios en el menú lateral con Listas de precios' },
            { type: 'new', text: 'Se agrega pestaña de Precios en la ficha de artículo' },
            { type: 'new', text: 'Se agrega campo de costo en artículos con control de acceso por permiso' },
            { type: 'improved', text: 'Se mejora la ficha de artículo con pestañas de Umbrales y Precios' },
            { type: 'improved', text: 'Se muestra precio de lista por defecto en la tabla de artículos' },
        ],
    },
    {
        date: '13 de abril, 2026',
        changes: [
            { type: 'new', text: 'Se agrega registro de visitas al local con selector de tipo de visitante y características' },
            { type: 'new', text: 'Se agrega resolución de visitas pendientes como compra o no compra' },
            { type: 'new', text: 'Se agrega dashboard de conversión con métricas del día, semana y mes' },
            { type: 'new', text: 'Se agrega configuración de características de visitante con selector de íconos' },
            { type: 'new', text: 'Se agrega configuración de razones de no compra con sub-razones' },
            { type: 'new', text: 'Se agrega sección Visitas en el menú lateral' },
        ],
    },
    {
        date: '8 de abril, 2026',
        changes: [
            { type: 'new', text: 'Se agrega gestión de clientes con listado, creación y edición' },
            { type: 'new', text: 'Se agrega gestión de proveedores con listado, creación y edición' },
            { type: 'new', text: 'Se agrega gestión de ubicaciones de almacenamiento' },
            { type: 'new', text: 'Se agrega registro de movimientos de inventario (entradas y salidas)' },
            { type: 'new', text: 'Se agrega visualización de stock por ubicación en el artículo' },
        ],
    },
    {
        date: '29 de marzo, 2026',
        changes: [
            { type: 'new', text: 'Se agrega gestión de artículos con variantes por talle y color' },
            { type: 'new', text: 'Se agrega clasificación de artículos por familias, grupos y subgrupos' },
            { type: 'new', text: 'Se agrega gestión de colores con paletas y códigos' },
            { type: 'new', text: 'Se agrega gestión de talles y curvas de talle/color' },
            { type: 'new', text: 'Se agrega grilla de stock por variante (talle/color) en el artículo' },
        ],
    },
    {
        date: '27 de marzo, 2026',
        changes: [
            { type: 'fixed', text: 'Se corrige error que impedía asociar imagen al guardar un ejemplo' },
            { type: 'improved', text: 'Se mejora formulario de ejemplo con campo de subida de imagen' },
            { type: 'improved', text: 'Se reorganiza menú principal con secciones Ejemplo, Administración y Configuración' },
            { type: 'fixed', text: 'Se corrige error en módulo de envío de notificaciones' },
        ],
    },
];
