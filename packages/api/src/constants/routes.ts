import { PERMISOS } from './permisos';

export const MENU = [
    // Módulo: Precios
    {
        title: 'Precios',
        icon: 'Tag',
        items: [
            {
                id: PERMISOS.RUTA_LISTAS_PRECIOS,
                title: 'Listas de precios',
                url: '/listas-de-precios',
                icon: 'BadgeDollarSign',
            },
        ]
    },

    // Módulo: Catálogo
    {
        title: 'Catálogo',
        icon: 'Package',
        items: [
            {
                id: PERMISOS.RUTA_ARTICULOS,
                title: 'Artículos',
                url: '/articulos',
                icon: 'ShoppingBag',
            },
            {
                id: PERMISOS.RUTA_FAMILIAS,
                title: 'Familias',
                url: '/familias',
                icon: 'FolderOpen',
            },
            {
                id: PERMISOS.RUTA_GRUPOS,
                title: 'Grupos',
                url: '/grupos',
                icon: 'Layers',
            },
            {
                id: PERMISOS.RUTA_SUBGRUPOS,
                title: 'Subgrupos',
                url: '/subgrupos',
                icon: 'Layers2',
            },
            {
                id: PERMISOS.RUTA_COLORES,
                title: 'Colores',
                url: '/colores',
                icon: 'Palette',
            },
            {
                id: PERMISOS.RUTA_CURVAS_COLOR,
                title: 'Curvas de Color',
                url: '/curvas-color',
                icon: 'Palette',
            },
            {
                id: PERMISOS.RUTA_TALLES,
                title: 'Talles',
                url: '/talles',
                icon: 'Ruler',
            },
            {
                id: PERMISOS.RUTA_CURVAS_TALLE,
                title: 'Curvas de Talle',
                url: '/curvas-talle',
                icon: 'LineChart',
            },
        ]
    },

    // Módulo: Administración
    {
        title: 'Administración',
        icon: 'Settings',
        items: [
            {
                id: PERMISOS.RUTA_USUARIOS,
                title: 'Usuarios',
                url: '/usuarios',
                icon: 'Users',
            },
            {
                id: PERMISOS.RUTA_ROLES,
                title: 'Roles',
                url: '/roles',
                icon: 'ShieldCheck',
            },
            {
                id: PERMISOS.RUTA_SMTP_CLIENT,
                title: 'SMTP',
                url: '/administracion/smtp-client',
                icon: 'Mail',
            },
            {
                id: PERMISOS.RUTA_PLANTILLA_NOTIFICACION,
                title: 'Plantillas de Notificación',
                url: '/administracion/plantillas',
                icon: 'FileText',
            },
            {
                id: PERMISOS.RUTA_ENVIO_NOTIFICACION,
                title: 'Envíos de Notificación',
                url: '/administracion/envios-notificacion',
                icon: 'Send',
            },
        ]
    },

    // Módulo: Cajas
    {
        title: 'Caja',
        icon: 'Landmark',
        items: [
            {
                id: PERMISOS.RUTA_CAJAS,
                title: 'Estado de Caja',
                url: '/cajas',
                icon: 'Landmark',
            },
            {
                id: PERMISOS.RUTA_CAJAS,
                title: 'Historial',
                url: '/cajas/historial',
                icon: 'History',
            },
        ]
    },

    // Módulo: Ventas
    {
        title: 'Ventas',
        icon: 'ShoppingCart',
        items: [
            {
                id: PERMISOS.RUTA_VENTAS,
                title: 'Ventas',
                url: '/ventas',
                icon: 'Receipt',
            },
            {
                id: PERMISOS.RUTA_NOTAS_CREDITO,
                title: 'Notas de Crédito',
                url: '/ventas/notas-de-credito',
                icon: 'FileMinus',
            },
            {
                id: PERMISOS.RUTA_NOTAS_DEBITO,
                title: 'Notas de Débito',
                url: '/ventas/notas-de-debito',
                icon: 'FilePlus',
            },
        ]
    },

    // Módulo: Visitas y Conversión
    {
        title: 'Visitas',
        icon: 'UserCheck',
        items: [
            {
                id: PERMISOS.RUTA_REGISTRO_VISITAS,
                title: 'Registro de visitas',
                url: '/registro-visitas',
                icon: 'UserPlus',
            },
            {
                id: PERMISOS.RUTA_DASHBOARD_CONVERSION,
                title: 'Conversión',
                url: '/dashboard/conversion',
                icon: 'TrendingUp',
            },
            {
                id: PERMISOS.RUTA_CONFIG_CARACTERISTICAS,
                title: 'Características de visitante',
                url: '/visitas/caracteristicas-visitante',
                icon: 'Tag',
            },
            {
                id: PERMISOS.RUTA_CONFIG_RAZONES_NO_COMPRA,
                title: 'Razones de no compra',
                url: '/visitas/razones-no-compra',
                icon: 'AlertCircle',
            },
        ]
    },

    // Módulo: Inventario
    {
        title: 'Inventario',
        icon: 'Warehouse',
        items: [
            {
                id: PERMISOS.RUTA_DASHBOARD,
                title: 'Dashboard',
                url: '/dashboard',
                icon: 'LayoutDashboard',
            },
            {
                id: PERMISOS.RUTA_MOVIMIENTOS,
                title: 'Movimientos',
                url: '/movimientos',
                icon: 'ArrowLeftRight',
            },
            {
                id: PERMISOS.RUTA_UBICACIONES,
                title: 'Ubicaciones',
                url: '/ubicaciones',
                icon: 'MapPin',
            },
        ]
    },

    // Módulo: Contactos
    {
        title: 'Contactos',
        icon: 'BookUser',
        items: [
            {
                id: PERMISOS.RUTA_PROVEEDORES,
                title: 'Proveedores',
                url: '/proveedores',
                icon: 'Truck',
            },
            {
                id: PERMISOS.RUTA_CLIENTES,
                title: 'Clientes',
                url: '/clientes',
                icon: 'UserRound',
            },
        ]
    },

    // Etiquetas
    {
        title: 'Etiquetas',
        icon: 'Tag',
        items: [
            {
                id: PERMISOS.RUTA_ETIQUETAS,
                title: 'Nueva impresión',
                url: '/etiquetas/nueva',
                icon: 'Printer',
            },
        ]
    },

    // Configuración
    {
        title: 'Configuración',
        icon: 'SlidersHorizontal',
        items: [
            {
                id: PERMISOS.RUTA_VENDEDORES,
                title: 'Vendedores',
                url: '/config/vendedores',
                icon: 'UserTie',
            },
            {
                id: PERMISOS.RUTA_METODOS_PAGO,
                title: 'Métodos de pago',
                url: '/config/metodos-pago',
                icon: 'CreditCard',
            },
            {
                id: PERMISOS.RUTA_ETIQUETAS,
                title: 'Impresora de etiquetas',
                url: '/config/impresora-etiquetas',
                icon: 'PrinterCheck',
            },
            {
                id: PERMISOS.RUTA_CONFIG_CONCEPTOS,
                title: 'Conceptos de Movimiento',
                url: '/config/cajas/conceptos',
                icon: 'ListOrdered',
            },
        ]
    },
];
