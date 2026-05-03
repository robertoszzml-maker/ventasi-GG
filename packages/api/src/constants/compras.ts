// Constantes para estados de compras (SOLCOM, OFERTA, ORDEN_COMPRA)

export const ESTADO_SOLCOM_CODIGOS = {
  SOLC_INI: 'SOLC_INI',     // Iniciada
  SOLC_RECH: 'SOLC_RECH',   // Rechazada
  SOLC_AP: 'SOLC_AP',       // Aprobada
  SOLC_FIN: 'SOLC_FIN',     // Finalizada
} as const;

export type EstadoSolcomCodigo = typeof ESTADO_SOLCOM_CODIGOS[keyof typeof ESTADO_SOLCOM_CODIGOS];

// Puedes agregar más constantes para OFERTA y ORDEN_COMPRA aquí en el futuro
export const ESTADO_OFERTA_CODIGOS = {
  OF_INICIADA: 'OF_INICIADA',
  OF_VALIDACION: 'OF_VALIDACION',
  OF_RECHAZADA: 'OF_RECHAZADA',
  OF_ACEPTADA: 'OF_ACEPTADA',
} as const;

export const ESTADO_ORDEN_COMPRA_CODIGOS = {
  // TODO: Agregar códigos de estados de órdenes de compra
  OC_EMITIDA: 'OC_EMITIDA',
  OC_CANCELADA: 'OC_CANCELADA',
  OC_RECEPCIONADA: 'OC_RECEPCIONADA',
  OC_RECEP_PARCIAL: 'OC_RECEP_PARCIAL',
} as const;

// Constantes para los tipos de aprobación de ofertas
export const APROBACION_OFERTA_TIPO_CODIGOS = {
  APROB_TEC: 'APROB_TEC',
  APROB_CAL: 'APROB_CAL',
  APROB_GER: 'APROB_GER',
  APROB_ADM: 'APROB_ADM',
} as const;

export type AprobacionOfertaTipoCodigo = typeof APROBACION_OFERTA_TIPO_CODIGOS[keyof typeof APROBACION_OFERTA_TIPO_CODIGOS];
