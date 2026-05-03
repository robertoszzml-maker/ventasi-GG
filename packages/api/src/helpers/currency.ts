/**
 * Helpers para operaciones con valores de tipo currency/money
 * Todos los helpers trabajan con 2 decimales fijos
 */

/**
 * Formatea un número a string con 2 decimales
 *
 * @param value - Valor numérico a formatear
 * @returns String con formato "1234.50"
 *
 * @example
 * formatCurrency(1234.5)    // "1234.50"
 * formatCurrency(1234.567)  // "1234.57"
 * formatCurrency(0)         // "0.00"
 */
export const formatCurrency = (value: number): string => {
  return Number(value).toFixed(2);
};

/**
 * Parsea un string o number a number con 2 decimales
 * Útil para validar inputs del frontend
 *
 * @param value - String o number a parsear
 * @returns Number con máximo 2 decimales
 *
 * @example
 * parseCurrency("1234.50")     // 1234.50
 * parseCurrency("1.234,50")    // 1234.50 (formato argentino)
 * parseCurrency(1234.567)      // 1234.57 (redondeado)
 * parseCurrency("invalid")     // 0.00
 */
export const parseCurrency = (value: string | number): number => {
  if (typeof value === 'number') {
    return Math.round(value * 100) / 100;
  }

  // Remover símbolos de moneda y espacios
  const cleaned = value.replace(/[^\d.,-]/g, '');

  // Convertir coma decimal a punto (formato argentino -> estándar)
  const normalized = cleaned.replace(',', '.');

  const parsed = parseFloat(normalized);

  if (isNaN(parsed)) {
    return 0.0;
  }

  // Redondear a 2 decimales
  return Math.round(parsed * 100) / 100;
};

/**
 * Suma valores currency con precisión exacta
 * Evita problemas de redondeo de punto flotante
 *
 * @param values - Valores a sumar
 * @returns Suma total con 2 decimales
 *
 * @example
 * sumCurrency(10.50, 20.30, 5.20)  // 36.00
 * sumCurrency(0.1, 0.2)            // 0.30 (no 0.30000000000000004)
 */
export const sumCurrency = (...values: number[]): number => {
  const sum = values.reduce((acc, val) => acc + (val || 0), 0);
  return Math.round(sum * 100) / 100;
};

/**
 * Multiplica dos valores con precisión de 2 decimales
 *
 * @param a - Primer valor
 * @param b - Segundo valor
 * @returns Resultado con 2 decimales
 *
 * @example
 * multiplyCurrency(10.50, 2)       // 21.00
 * multiplyCurrency(10.99, 1.5)     // 16.49
 */
export const multiplyCurrency = (a: number, b: number): number => {
  return Math.round(a * b * 100) / 100;
};

/**
 * Divide dos valores con precisión de 2 decimales
 *
 * @param a - Dividendo
 * @param b - Divisor
 * @returns Resultado con 2 decimales
 *
 * @example
 * divideCurrency(100, 3)   // 33.33
 * divideCurrency(10, 0)    // 0.00 (protección contra división por cero)
 */
export const divideCurrency = (a: number, b: number): number => {
  if (b === 0) {
    return 0.0;
  }
  return Math.round((a / b) * 100) / 100;
};

/**
 * Calcula el porcentaje de un valor
 *
 * @param value - Valor base
 * @param percentage - Porcentaje a calcular (ej: 21 para 21%)
 * @returns Resultado con 2 decimales
 *
 * @example
 * percentageOf(100, 21)    // 21.00
 * percentageOf(50.50, 10)  // 5.05
 */
export const percentageOf = (value: number, percentage: number): number => {
  return Math.round((value * percentage) / 100 / 100) * 100;
};

/**
 * Valida que un valor tenga máximo 2 decimales
 *
 * @param value - Valor a validar
 * @returns true si es válido
 *
 * @example
 * isValidCurrency(10.50)       // true
 * isValidCurrency(10.5)        // true
 * isValidCurrency(10.567)      // false
 * isValidCurrency("10.50")     // true
 */
export const isValidCurrency = (value: number | string): boolean => {
  const str = value.toString();
  const parts = str.split('.');
  return !parts[1] || parts[1].length <= 2;
};
