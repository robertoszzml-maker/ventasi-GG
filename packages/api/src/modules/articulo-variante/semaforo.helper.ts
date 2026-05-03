export type EstadoSemaforo = 'ROJO' | 'AMARILLO' | 'VERDE' | 'SIN_ESTADO';

export function calcularEstadoSemaforo(
  stock: number,
  minimo: number | null,
  seguridad: number | null,
): EstadoSemaforo {
  if (minimo === null || minimo === undefined) return 'SIN_ESTADO';
  if (stock <= minimo) return 'ROJO';
  if (seguridad !== null && seguridad !== undefined && stock <= seguridad) return 'AMARILLO';
  return 'VERDE';
}
