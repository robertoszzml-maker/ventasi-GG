// Constantes para estados de factura

export const FACTURA_ESTADO = {
  PENDIENTE: 'pendiente',
  PAGADO: 'pagado',
  PARCIAL: 'parcial',
} as const;

export type FacturaEstado = typeof FACTURA_ESTADO[keyof typeof FACTURA_ESTADO];
