import { PROCESO_GENERAL } from "@/constants/presupuesto";
import { PresupuestosFechasChart } from "@/components/charts/presupuestos/presupuestos-fechas-chart";

// Registro de componentes disponibles
export const COMPONENTES_CHART = {
  PresupuestosFechasChart,
  // Aquí se pueden agregar más componentes en el futuro
  // PresupuestosClientesChart,
  // PresupuestosAreaChart,
  // etc...
} as const;

export type ComponenteChartType = keyof typeof COMPONENTES_CHART;
const fechaActual = new Date();
const mesActual = fechaActual.getMonth() + 1;
const anioActual = fechaActual.getFullYear();

// Calcular fechas del último mes
const primerDiaUltimoSemestre = new Date(anioActual, mesActual - 6, 1);
const ultimoDiaUltimoSemestre = new Date(anioActual, mesActual, 0);

const fromUltimoSemestre = primerDiaUltimoSemestre.toISOString().split('T')[0];
const toUltimoSemestre = ultimoDiaUltimoSemestre.toISOString().split('T')[0];


const primerDiaUltimoMes = new Date(anioActual, mesActual - 1, 1);
const ultimoDiaUltimoMes = new Date(anioActual, mesActual, 0);

const fromUltimoMes = primerDiaUltimoMes.toISOString().split('T')[0];
const toUltimoMes = ultimoDiaUltimoMes.toISOString().split('T')[0];


// Configuración unificada para dashboards de presupuestos
export const DASHBOARD_PRESUPUESTOS_CONFIG = {
  // Configuración para el dashboard principal (8 cards específicas)
  DASHBOARD_CARDS: [

    // FASE COMERCIAL
    {
      id: 1,
      key: "costeo-tecnico",
      titulo: "Costeo técnico",
      procesos: [PROCESO_GENERAL.COSTEO_TECNICO],
      color: "#16a085",
      tipo: "cantidad" as const,
      componente: "PresupuestosFechasChart" as const,
      linkDestino: "/presupuestos/dashboard/costeo-tecnico",
      options: {
        anioActual: null,
        mesActual: null,
        modo: "mensual" as const,
      }
    },
    {
      id: 2,
      key: "costeo-comercial",
      titulo: "Costeo comercial",
      procesos: [PROCESO_GENERAL.COSTEO_COMERCIAL],
      color: "#16a085",
      tipo: "cantidad" as const,
      componente: "PresupuestosFechasChart" as const,
      linkDestino: "/presupuestos/dashboard/costeo-comercial",
      options: {
        anioActual: null,
        mesActual: null,
        modo: "mensual" as const,
      }
    },
    {
      id: 3,
      key: "propuestas-preparadas",
      titulo: "Propuestas preparadas",
      procesos: [PROCESO_GENERAL.PROPUESTA_PREPARADA],
      color: "#16a085",
      tipo: "auditoria" as const,
      componente: "PresupuestosFechasChart" as const,
      linkDestino: "/presupuestos/dashboard/propuestas-preparadas",
      options: {
        anioActual: null,
        mesActual: null,
        modo: "mensual" as const,
      }
    },
    {
      id: 4,
      key: "propuestas-presentadas",
      titulo: "Propuestas presentadas",
      procesos: [PROCESO_GENERAL.PROPUESTA_PRESENTADA],
      color: "#16a085",
      tipo: "auditoria" as const,
      componente: "PresupuestosFechasChart" as const,
      linkDestino: "/presupuestos/dashboard/propuestas-presentadas",
      options: {
        anioActual: null,
        mesActual: null,
        modo: "mensual" as const,
      }
    },
    {
      id: 5,
      key: "propuestas-perdidas-suspendidas",
      titulo: "Perdidas/suspendidas",
      procesos: [PROCESO_GENERAL.PERDIDA_SUSPENDIDA],
      color: "#16a085",
      tipo: "auditoria" as const,
      componente: "PresupuestosFechasChart" as const,
      linkDestino: "/presupuestos/dashboard/propuestas-perdidas-suspendidas",
      options: {
        anioActual: null,
        mesActual: null,
        modo: "mensual" as const,
      }
    },
    // FASE PRODUCTIVA
    {
      id: 5,
      key: "propuestas-enviadas-almacen",
      titulo: "Enviadas a almacen",
      procesos: [PROCESO_GENERAL.ENVIADO_A_ALMACEN],
      color: "#002776",
      tipo: "auditoria" as const,
      componente: "PresupuestosFechasChart" as const,
      linkDestino: "/presupuestos/dashboard/propuestas-enviadas-almacen",
      options: {
        anioActual: null,
        mesActual: null,
        modo: "mensual" as const,
      }
    },
    {
      id: 18,
      key: "propuestas-pendientes-compras",
      titulo: "Pendientes compras",
      procesos: [PROCESO_GENERAL.PENDIENTE_DE_COMPRAS],
      color: "#f25e02",
      tipo: "auditoria" as const,
      componente: "PresupuestosFechasChart" as const,
      linkDestino: "/presupuestos/dashboard/propuestas-pendientes-compras",
      options: {
        anioActual: null,
        mesActual: null,
        modo: "mensual" as const,
      }
    },
    {
      id: 17,
      key: "propuestas-enviadas-produccion",
      titulo: "Enviadas a producción",
      procesos: [PROCESO_GENERAL.ENVIADO_A_PRODUCCION],
      color: "#e74c3c",
      tipo: "auditoria" as const,
      componente: "PresupuestosFechasChart" as const,
      linkDestino: "/presupuestos/dashboard/propuestas-enviadas-produccion",
      options: {
        anioActual: null,
        mesActual: null,
        modo: "mensual" as const,
      }
    },
    {
      id: 6,
      key: "propuestas-produccion",
      titulo: "En Producción",
      procesos: [PROCESO_GENERAL.EN_PRODUCCION],
      color: "#e74c3c",
      tipo: "auditoria" as const,
      componente: "PresupuestosFechasChart" as const,
      linkDestino: "/presupuestos/dashboard/propuestas-produccion",
      options: {
        anioActual: null,
        mesActual: null,
        modo: "mensual" as const,
      }
    },
    {
      id: 7,
      key: "fabricacion-produccion",
      titulo: "producción (PROYECTADO)",
      procesos: [
        PROCESO_GENERAL.EN_PRODUCCION,
      ],
      color: "#e74c3c",
      tipo: "fecha" as const,
      componente: "PresupuestosFechasChart" as const,
      linkDestino: "/presupuestos/dashboard/fabricacion-produccion",
      options: {
        anioActual,
        mesActual,
        modo: "semanal" as const,
        campoFecha: 'fechaFabricacionEstimada'

      }
    },
    {
      id: 8,
      key: "terminados",
      titulo: "Producto terminado",
      procesos: [PROCESO_GENERAL.TRABAJO_TERMINADO],
      color: "#e74c3c",
      tipo: "auditoria" as const,
      componente: "PresupuestosFechasChart" as const,
      linkDestino: "/presupuestos/dashboard/terminados",
      options: {
        anioActual: null,
        mesActual: null,
        modo: "mensual" as const,
      }
    },

    // // FASE SERVICIO
    {
      id: 10,
      key: "enviados-servicio",
      titulo: "Enviados a servicio",
      procesos: [PROCESO_GENERAL.ENVIADO_A_SERVICIO],
      color: "#2980b9",
      tipo: "auditoria" as const,
      componente: "PresupuestosFechasChart" as const,
      linkDestino: "/presupuestos/dashboard/enviados-servicio",
      options: {
        anioActual: null,
        mesActual: null,
        modo: "mensual" as const,
      }
    },
    {
      id: 11,
      key: "entrega-servicio",
      titulo: "En servicio (PROYECTADO)",
      procesos: [PROCESO_GENERAL.EN_SERVICIO],
      color: "#2980b9",
      tipo: "fecha" as const,
      componente: "PresupuestosFechasChart" as const,
      linkDestino: "/presupuestos/dashboard/entrega-servicio",
      options: {
        anioActual,
        mesActual,
        modo: "semanal" as const,
        campoFecha: 'fechaEntregaEstimada'

      }
    },
    // FASE ENTREGA
    {
      id: 12,
      key: "entregados",
      titulo: "Entregados",
      procesos: [PROCESO_GENERAL.ENTREGADO],
      color: "#ebe834",
      tipo: "fecha" as const,
      componente: "PresupuestosFechasChart" as const,
      linkDestino: "/presupuestos/dashboard/entregados",
      options: {
        anioActual,
        mesActual,
        modo: "semanal" as const,
        campoFecha: 'fechaEntregado'

      }
    },
    // // FASE ADMINISTRATIVA
    {
      id: 13,
      key: "certificacion-pendiente",
      titulo: "Pendiente de certificación",
      procesos: [PROCESO_GENERAL.CERTIFICACION_PENDIENTE],
      color: "#ea4fff",
      tipo: "auditoria" as const,
      componente: "PresupuestosFechasChart" as const,
      linkDestino: "/presupuestos/dashboard/certificacion-pendiente",
      options: {
        anioActual: null,
        mesActual: null,
        modo: "mensual" as const,
      }
    },
    {
      id: 15,
      key: "facturacion-habilitada",
      titulo: "Facturación habilitada",
      procesos: [PROCESO_GENERAL.FACTURACION_HABILITADA],
      color: "#ea4fff",
      tipo: "auditoria" as const,
      componente: "PresupuestosFechasChart" as const,
      linkDestino: "/presupuestos/dashboard/facturacion-habilitada",
      options: {
        anioActual: null,
        mesActual: null,
        modo: "mensual" as const,
      }
    },
    {
      id: 15,
      key: "facturacion-mensual",
      titulo: "Facturación ",
      procesos: [PROCESO_GENERAL.FACTURADO],
      color: "#ea4fff",
      tipo: "auditoria" as const,
      componente: "PresupuestosFechasChart" as const,
      linkDestino: "/presupuestos/dashboard/facturacion-mensual",
      options: {
        modo: "mensual" as const,
        variante: 'acumulado',
        from: fromUltimoMes,
        to: toUltimoMes,
      }
    },
    {
      id: 14,
      key: "pendiente-cobro",
      titulo: "Pendientes de cobros",
      procesos: [PROCESO_GENERAL.FACTURADO],
      color: "#ea4fff",
      tipo: "auditoria" as const,
      componente: "PresupuestosFechasChart" as const,
      linkDestino: "/presupuestos/dashboard/pendiente-cobro",
      options: {
        anioActual: null,
        mesActual: null,
        modo: "mensual" as const,
      }
    },
    {
      id: 16,
      key: "cobrados",
      titulo: "Cobrados semestral",
      procesos: [PROCESO_GENERAL.COBRADO],
      color: "#ea4fff",
      tipo: "auditoria" as const,
      componente: "PresupuestosFechasChart" as const,
      linkDestino: "/presupuestos/dashboard/cobrados",
      options: {
        anioActual: null,
        mesActual: null,
        modo: "mensual" as const,
        from: fromUltimoSemestre,
        to: toUltimoSemestre,
      }
    },

  ],


};

// Helper para obtener configuración de dashboard por key
export const getDashboardConfig = (key: string) => {
  return DASHBOARD_PRESUPUESTOS_CONFIG.DASHBOARD_CARDS.find(card => card.key === key);
};

// Helper para obtener el componente dinámicamente
export const getChartComponent = (nombreComponente: ComponenteChartType) => {
  return COMPONENTES_CHART[nombreComponente];
};

// Helper para crear objeto de configuración compatible con el formato anterior
export const getDashboardConfigAsObject = () => {
  return DASHBOARD_PRESUPUESTOS_CONFIG.DASHBOARD_CARDS.reduce((acc, card) => {
    acc[card.key] = {
      titulo: card.titulo,
      procesos: card.procesos,
      color: card.color,
      tipo: card.tipo,
      options: card.options,
    };
    return acc;
  }, {} as Record<string, any>);
};
