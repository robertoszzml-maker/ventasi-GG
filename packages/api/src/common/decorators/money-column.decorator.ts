import { Column, ColumnOptions } from 'typeorm';
import { currencyTransformer } from '../transformers/currency.transformer';

/**
 * Decorator personalizado para columnas de tipo money/currency
 *
 * Automáticamente configura la columna como:
 * - Tipo: VARCHAR(20) en la base de datos
 * - Default: '0.00'
 * - Transformer: Convierte automáticamente entre string (DB) y number (TypeScript)
 * - Precisión: Siempre 2 decimales fijos
 *
 * @param options - Opciones adicionales de columna (nullable, name, comment, etc.)
 *
 * @example
 * // Uso básico
 * @MoneyColumn()
 * precio: number;
 *
 * @example
 * // Con nombre de columna personalizado
 * @MoneyColumn({ name: 'precio_unitario' })
 * precioUnitario: number;
 *
 * @example
 * // Nullable
 * @MoneyColumn({ nullable: true })
 * descuento?: number;
 *
 * @example
 * // Con nombre custom + nullable
 * @MoneyColumn({ name: 'venta_total', nullable: true })
 * ventaTotal?: number;
 *
 * @example
 * // Con comentario para la columna
 * @MoneyColumn({ comment: 'Precio de venta al público' })
 * pvp: number;
 */
export function MoneyColumn(options?: Partial<ColumnOptions>): PropertyDecorator {
  return Column({
    type: 'varchar',
    length: 20,
    default: null,
    transformer: currencyTransformer,
    ...options, // Permite override de opciones si es necesario
  });
}
