/**
 * Constantes de configuraciones del sistema
 *
 * Este archivo mapea las claves de configuración para evitar errores de tipeo
 * y facilitar el uso de configuraciones en el código.
 *
 * IMPORTANTE: Debe estar sincronizado con packages/api/src/constants/config.ts
 */

export const CONFIGURACIONES = {
  // Módulo: Compras
  ORDEN_COMPRA_LIMITE_MONTO: 'orden_compra_limite_monto',

  // Módulo: Cashflow
  CASHFLOW_DIAS_HABILES_EDICION: 'cashflow_dias_habiles_edicion',
  CASHFLOW_PERMITIR_EDICION_SIN_LIMITE: 'cashflow_permitir_edicion_sin_limite',

  // Módulo: Notificaciones
  NOTIFICACIONES_EMAIL_FROM: 'notificaciones_email_from',
  NOTIFICACIONES_EMAIL_ACTIVO: 'notificaciones_email_activo',
  NOTIFICACIONES_EMAIL_TEST: 'notificaciones_email_test',

  // Módulo: Ejemplo
  EJEMPLO_LIMITE_REGISTROS: 'EJEMPLO_LIMITE_REGISTROS',
  EJEMPLO_ESTADO_DEFAULT: 'EJEMPLO_ESTADO_DEFAULT',
  EJEMPLO_PERMITIR_SIN_IMAGEN: 'EJEMPLO_PERMITIR_SIN_IMAGEN',

  // Agregar aquí nuevas configuraciones siguiendo el patrón:
  // NOMBRE_DESCRIPTIVO: 'clave_en_base_de_datos',
} as const;

export type ConfiguracionesType =
  (typeof CONFIGURACIONES)[keyof typeof CONFIGURACIONES];
