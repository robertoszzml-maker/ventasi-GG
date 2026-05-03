export const PRESUPUESTO = {
    CERTIFICADO_CARGADO: "presupuesto.certificado",
    ENTREGA_CONFIRMADA: "presupuesto.entregado",
    SERVICIO_VERIFICADO: "presupuesto.servicio_verificado",
    FACTURA_GENERADA: "presupuesto.factura_generada",
    COBRO_GENERADO: "presupuesto.cobro_generado",
    FECHA_ENTREGA_ESTIMADA: "presupuesto.fecha_entrega_estimada",
}

export const BANCOS = {
    SALDO_ACTUALIZADO: "banco.saldo_actualizado",
}

export const INVENTARIO = {
    INGRESO_MERCADERIA: "inventario.ingreso_mercaderia",
}

export const FACTURACION = {
    FACTURA_CREADA: "factura.nuevo",
}
export const COBROS = {
    COBRO_CREADA: "cobro.nuevo",
    COBRO_MASIVO_CREADO: "cobro.masivo_creado", // Solo para actualizar estados, NO crea transacciones
}