export const CANAL_OPTIONS = [
    { value: 'ambos', label: 'Email y WhatsApp' },
    { value: 'email', label: 'Solo Email' },
    { value: 'whatsapp', label: 'Solo WhatsApp' },
] as const;

export const VARIABLES_CLIENTE = [
    { variable: '{{cliente_nombre}}', descripcion: 'Nombre del cliente' },
    { variable: '{{cliente_email}}', descripcion: 'Email del cliente' },
    { variable: '{{cliente_tel}}', descripcion: 'Teléfono del cliente' },
    { variable: '{{cliente_razon_social}}', descripcion: 'Razón social' },
    { variable: '{{cliente_cuit}}', descripcion: 'CUIT del cliente' },
    { variable: '{{cliente_contacto}}', descripcion: 'Persona de contacto' },
];

export const VARIABLES_RESUMEN = [
    { variable: '{{total_facturas}}', descripcion: 'Cantidad de facturas agrupadas' },
    { variable: '{{total_deuda}}', descripcion: 'Suma total de montos netos ($)' },
    { variable: '{{total_importe_bruto}}', descripcion: 'Suma total de importes brutos ($)' },
    { variable: '{{lista_facturas}}', descripcion: 'Lista formateada de facturas (folio, fecha, importe bruto, alícuota, monto neto)' },
];

export const VARIABLES_FACTURA_INDIVIDUAL = [
    { variable: '{{factura_folio}}', descripcion: 'Folio (solo 1 factura)' },
    { variable: '{{factura_monto}}', descripcion: 'Monto neto (solo 1 factura)' },
    { variable: '{{factura_importe_bruto}}', descripcion: 'Importe bruto (solo 1 factura)' },
    { variable: '{{factura_alicuota}}', descripcion: 'Alícuota (solo 1 factura)' },
    { variable: '{{factura_fecha}}', descripcion: 'Fecha (solo 1 factura)' },
    { variable: '{{factura_vencimiento}}', descripcion: 'Fecha de vencimiento (solo 1 factura)' },
    { variable: '{{factura_estado}}', descripcion: 'Estado de la factura (solo 1 factura)' },
];

export const TODAS_LAS_VARIABLES = [
    ...VARIABLES_CLIENTE,
    ...VARIABLES_RESUMEN,
    ...VARIABLES_FACTURA_INDIVIDUAL,
];
