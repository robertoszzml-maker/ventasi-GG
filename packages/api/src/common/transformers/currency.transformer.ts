import { ValueTransformer } from 'typeorm';

/**
 * Transformer para campos de tipo currency/money
 *
 * Convierte automáticamente entre:
 * - Base de datos: VARCHAR(20) que almacena "1234.50"
 * - TypeScript: number que trabaja con 1234.50
 *
 * Siempre mantiene 2 decimales fijos.
 *
 * @example
 * // En la entidad
 * @MoneyColumn()
 * monto: number;
 *
 * // TypeScript trabaja con number
 * cobro.monto = 1234.50;
 *
 * // En la DB se guarda como "1234.50"
 */
export class CurrencyTransformer implements ValueTransformer {
  /**
   * Convierte de TypeScript (number) a Base de Datos (string)
   * Se ejecuta al hacer INSERT o UPDATE
   */
  to(value: number | null | undefined): string | null {
    if (value === null || value === undefined) {
      return null;
    }
    return Number(value).toFixed(2);
  }

  /**
   * Convierte de Base de Datos (string) a TypeScript (number)
   * Se ejecuta al hacer SELECT
   */
  from(value: string | null | undefined): number | null {
    if (!value || value === '') {
      return null;
    }
    return parseFloat(value);
  }
}

/**
 * Instancia singleton del transformer para reutilizar
 */
export const currencyTransformer = new CurrencyTransformer();
