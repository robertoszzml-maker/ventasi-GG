import {
    ColumnFiltersState,
    PaginationState,
    SortingState,
    Table
} from "@tanstack/react-table";

declare module "@tanstack/react-table" {
    interface ColumnMeta<TData> {
        customFilter?: (table: Table<TData>) => JSX.Element;
        filterVariant?: string;
        filterOptions?: { label: string; value: string }[];
    }
}

export type PaginationParam = {
    pageIndex: number;
    pageSize: number
}

export type OptionsValue = {
    label: string;
    value: string | number
}

export type Query = {
    pagination: PaginationState;
    columnFilters?: ColumnFiltersState
    sorting?: SortingState
    globalFilter?: string
    columnVisibility?: string[]
    enabled?: boolean
}

// --- Infraestructura: Archivo ---

export type Archivo = {
    id?: number;
    nombre?: string;
    nombreArchivo?: string;
    nombreArchivoOriginal?: string;
    url?: string;
    extension?: string;
    modelo: string;
    modeloId: number;
    tipo?: string;
}

// --- Infraestructura: Usuarios y Roles ---

export type Permiso = {
    id: number;
    nombre: string;
}

export type Usuario = {
    id?: number;
    email: string;
    password?: string | null;
    nombre?: string;
    active?: boolean;
    roleId?: number;
    role?: Role;
    telefono?: string;
    telefonoOtro?: string;
    attemps?: number;
    permisoId?: number;
    permiso?: Permiso;
}

export type User = {
    userId: number;
    nombre: string;
    email: string;
    roleId: number;
    roleName?: string;
    roleColor?: string;
    roleIcon?: string;
}

export interface Permission {
    id: number;
    codigo: string;
    descripcion?: string;
    modulo?: string;
}

export interface Role {
    id: number;
    nombre: string;
    descripcion?: string;
    parentId?: number;
    nivel?: number;
    color?: string;
    icono?: string;
    parent?: Role;
    children?: Role[];
    rolePermissions?: RolePermission[];
}

export interface RolePermission {
    id: number;
    roleId: number;
    permissionId: number;
    role?: Role;
    permission?: Permission;
}

export interface CreatePermissionDto {
    codigo: string;
    descripcion?: string;
    modulo?: string;
}

export interface UpdatePermissionDto {
    codigo?: string;
    descripcion?: string;
    modulo?: string;
}

export interface CreateRolePermissionDto {
    roleId: number;
    permissionId: number;
}

export interface SetRolePermissionsDto {
    roleId: number;
    permissionIds: number[];
}

// --- Infraestructura: Menú ---

export type Menu = ItemMenu[]

export interface ItemMenu {
    title: string
    url: string
    icon?: string
    isActive: boolean
    items: Item[]
}

export interface Item {
    title: string
    url: string
}

export interface Team {
    name: string
    logo: string
    plan: string
}

export interface CheckAccess {
    success: boolean
    hasPermission: boolean
    user: User
    menu: Menu
    permissions: Permission[]
}

// --- Infraestructura: Auditoría ---

export type Auditoria = {
    id: number;
    tabla: string;
    columna: string;
    valorAnterior?: string;
    valorNuevo?: string;
    registroId: number;
    usuarioId: number;
    usuario: Usuario;
    fecha: Date;
}

// --- Infraestructura: Mensajes ---

export type Mensaje = {
    id?: number
    tipoId: number;
    tipo: string;
    fecha?: string;
    mensaje?: string;
    usuarioOrigenId: number;
    usuarioOrigenNombre?: string;
    usuarioDestino?: number;
    usuarioDestinoNombre?: string;
    fecha_visto?: string;
    file?: Archivo;
}

// --- Infraestructura: Notificaciones ---

export type Notificacion = {
    id: number;
    tipoUsuario: number;
    tipoNotificacion?: string;
    usuarioOrigen: number;
    usuarioDestinoId: number;
    fecha?: string;
    nota?: string;
    tipoId?: number;
    tipo?: string;
    fechaVisto?: string
}

export type PlantillaNotificacion = {
    id?: number;
    nombre: string;
    descripcion?: string;
    asunto?: string;
    cuerpo: string;
    createdAt?: string;
    updatedAt?: string;
}

export type EnvioNotificacion = {
    id?: number;
    plantillaNotificacionId?: number;
    plantilla?: PlantillaNotificacion;
    modelo: string;
    modeloId: number;
    canal: 'email' | 'whatsapp';
    estado: 'pendiente' | 'enviado' | 'error';
    asuntoResuelto?: string;
    cuerpoResuelto: string;
    fechaEnvio?: string;
    emailDestinatario?: string;
    error?: string;
    createdAt?: string;
    createdBy?: number;
    createdByUser?: { id: number; nombre: string; email: string };
    updatedAt?: string;
    updatedBy?: number;
}

// --- Infraestructura: Configuración ---

export type Config = {
    id: number;
    clave: string;
    valor: string | null;
    modulo: string | null;
    descripcion: string | null;
    tipo: 'string' | 'number' | 'boolean' | 'json';
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
}

// --- Ejemplo ---

export type EjemploCategoria = {
    id?: number;
    nombre: string;
    descripcion?: string;
    createdAt?: string;
    updatedAt?: string;
    deletedAt?: string | null;
}

export type Ejemplo = {
    id?: number;
    nombre: string;
    descripcion?: string;
    fecha?: string;
    estado?: string;
    imagenId?: number;
    imagen?: Archivo;
    ejemploCategoriaId?: number;
    ejemploCategoria?: EjemploCategoria;
    createdAt?: string;
    updatedAt?: string;
    deletedAt?: string | null;
}

// --- Stock: Clasificación ---
export type Familia = { id?: number; nombre: string; silueta?: string; }
export type Grupo = { id?: number; nombre: string; familiaId: number; familia?: Familia; }
export type Subgrupo = { id?: number; nombre: string; grupoId: number; grupo?: Grupo & { familia?: Familia }; }

// --- Stock: Colores ---
export type ColorCodigo = { id?: number; colorId: number; hex: string; orden: number; }
export type Color = { id?: number; codigo: string; nombre: string; descripcion?: string; codigos?: ColorCodigo[]; codigosHex?: string[]; }
export type CurvaColor = { id?: number; nombre: string; descripcion?: string; colorIds?: number[]; colores?: Color[]; detalles?: CurvaColorDetalle[]; }
export type CurvaColorDetalle = { id?: number; curvaId: number; colorId: number; orden: number; color?: Color; }

// --- Stock: Talles ---
export type Talle = { id?: number; codigo: string; nombre: string; orden: number; }
export type CurvaTalle = { id?: number; nombre: string; descripcion?: string; talleIds?: number[]; talles?: Talle[]; detalles?: CurvaTalleDetalle[]; }
export type CurvaTalleDetalle = { id?: number; curvaId: number; talleId: number; orden: number; talle?: Talle; }

// --- Stock: Artículos ---
export type Articulo = {
    id?: number; nombre: string; descripcion?: string;
    codigo: string; sku: string; codigoBarras?: string; codigoQr?: string;
    costo?: number; alicuotaIva?: string; subgrupoId: number;
    curvaColorId?: number; curvaId?: number;
    tipoContinuidad?: 'continuidad' | 'temporada';
    esAncla?: boolean;
    subgrupo?: Subgrupo; curvaColor?: CurvaColor; curva?: CurvaTalle;
    talles?: ArticuloTalle[]; colores?: ArticuloColor[];
    totalVariantes?: number; stockTotal?: string;
    precioDefault?: number;
}

// --- Precios ---
export type ModoInicializacion = 'CERO' | 'COPIAR' | 'PORCENTAJE' | 'DESDE_COSTO';
export type ListaPrecio = {
    id?: number; nombre: string; descripcion?: string;
    esDefault?: number; activo?: number;
    modo?: ModoInicializacion; listaOrigenId?: number;
    porcentaje?: number; factor?: number;
}
export type ArticuloPrecio = {
    id?: number; articuloId: number; listaPrecioId: number;
    precio: number; articulo?: Articulo; listaPrecio?: ListaPrecio;
}
export type UpdatePrecioItem = { articuloId: number; listaPrecioId: number; precio: number; }
export type AplicarPorcentajePayload = { listaPrecioId: number; articuloIds: number[]; porcentaje: number; }
export type ArticuloTalle = { id?: number; articuloId: number; talleId: number; orden: number; talle?: Talle; }
export type ArticuloColor = { id?: number; articuloId: number; colorId: number; orden: number; color?: Color; }

// --- Stock: Variantes (Grilla) ---
export type EstadoSemaforo = 'ROJO' | 'AMARILLO' | 'VERDE' | 'SIN_ESTADO';
export type UmbralVariante = { stockMinimo?: number | null; stockSeguridad?: number | null; stockMaximo?: number | null; }
export type BulkUmbralPayload = UmbralVariante & { articuloId: number; }
export type ArticuloVariante = { id?: number; articuloId: number; talleId: number; colorId: number; cantidad: string; talle?: Talle; color?: Color; articulo?: { id?: number; nombre: string; sku?: string; }; codigoBarras?: string; }

export type VarianteEtiqueta = {
  articuloId: number;
  articuloNombre: string;
  varianteId: number;
  talleNombre: string;
  colorNombre: string;
  codigoBarras: string | null;
}
export type CeldaGrilla = {
    talleId: number; talleCodigo: string; talleNombre: string; talleOrden: number;
    colorId: number; colorCodigo: string; colorNombre: string; colorOrden: number; colorCodigos: string[];
    varianteId?: number; cantidad?: string;
    estado: 'potencial' | 'real';
    stockMinimo?: number | null; stockSeguridad?: number | null; stockMaximo?: number | null;
    estadoSemaforo?: EstadoSemaforo;
    codigoBarras?: string | null;
}
export type GrillaColor = { id: number; codigo: string; nombre: string; orden: number; codigos: string[]; }
export type GrillaArticulo = { celdas: CeldaGrilla[]; talles: Talle[]; colores: GrillaColor[]; stockTotal: number; }
export type IngresoItem = { talleId: number; colorId: number; cantidad: string; }

// --- Dashboard Anclas ---
export type VarianteAncla = {
    id: number; talleCodigo: string; talleNombre: string;
    colorCodigo: string; colorNombre: string;
    stockMinimo: number | null; stockSeguridad: number | null; stockMaximo: number | null;
    stockActual: number; estadoSemaforo: EstadoSemaforo;
}
export type ArticuloAncla = {
    id: number; nombre: string; codigo: string; tipoContinuidad?: string;
    stockTotal: number; estadoAgregado: EstadoSemaforo; variantes: VarianteAncla[];
}

// --- Inventario ---
export type Ubicacion = { id?: number; nombre: string; descripcion?: string; }
export type Proveedor = { id?: number; nombre: string; cuit?: string; telefono?: string; email?: string; }
export type Cliente = {
    id?: number; nombre: string; email?: string; telefono?: string;
    cuit?: string; condicionIva?: string;
    domicilio?: string; localidad?: string; provincia?: string; codigoPostal?: string;
}

export type TipoMovimiento = 'MOVIMIENTO' | 'ARREGLO';

export type DetalleMovimiento = {
    articuloVarianteId: number;
    articuloId?: number;
    talleId?: number;
    colorId?: number;
    cantidad: string;
    cantidadNueva?: string;
    cantidadAnterior?: string;
    articuloVariante?: ArticuloVariante;
}

export type UsuarioResumen = { id: number; nombre?: string; email: string; }

export type MovimientoInventario = {
    id?: number;
    tipo: TipoMovimiento;
    fecha: string;
    descripcion?: string;
    cantidadTotal?: string;
    responsableId?: number;
    responsable?: UsuarioResumen;
    procedenciaUbicacionId?: number;
    procedenciaProveedorId?: number;
    procedenciaClienteId?: number;
    destinoUbicacionId?: number;
    destinoProveedorId?: number;
    destinoClienteId?: number;
    procedenciaUbicacion?: Ubicacion;
    procedenciaProveedor?: Proveedor;
    procedenciaCliente?: Cliente;
    destinoUbicacion?: Ubicacion;
    destinoProveedor?: Proveedor;
    destinoCliente?: Cliente;
    detalles?: DetalleMovimiento[];
}

export type StockPorUbicacion = {
    id?: number;
    articuloVarianteId: number;
    ubicacionId: number;
    cantidad: string;
    articuloVariante?: ArticuloVariante;
    ubicacion?: Ubicacion;
}

export type CaracteristicaVisitante = {
    id?: number;
    nombre: string;
    icono: string;
    orden?: number;
    activo?: boolean;
}

export type SubRazonNoCompra = {
    id?: number;
    razonId?: number;
    nombre: string;
    orden?: number;
    activo?: boolean;
}

export type RazonNoCompra = {
    id?: number;
    nombre: string;
    orden?: number;
    activo?: boolean;
    subRazones?: SubRazonNoCompra[];
}

export type TipoVisitante = 'MUJER' | 'HOMBRE' | 'ADULTO_MAYOR' | 'JOVEN' | 'PAREJA' | 'FAMILIA' | 'GRUPO';
export type EstadoVisita = 'PENDIENTE' | 'COMPRA' | 'NO_COMPRA';

export type Visita = {
    id?: number;
    fecha?: string;
    hora?: string;
    tipoVisitante: TipoVisitante;
    estado?: EstadoVisita;
    movimientoId?: number;
    razonId?: number;
    subRazonId?: number;
    articuloId?: number;
    clienteId?: number;
    observaciones?: string;
    caracteristicas?: CaracteristicaVisitante[];
    razon?: RazonNoCompra;
    subRazon?: SubRazonNoCompra;
    articulo?: Articulo;
    cliente?: Cliente;
}

// --- Ventas ---
export type Vendedor = {
    id?: number;
    nombre: string;
    apellido: string;
    dni?: string;
    codigo: string;
    activo?: number;
}

export type CuotaMetodoPago = {
    id?: number;
    metodoPagoId: number;
    cantidadCuotas: number;
    tasaInteres: string;
    activo?: number;
}

export type TipoCobro = 'EFECTIVO' | 'DEBITO' | 'CREDITO' | 'QR' | 'TRANSFERENCIA' | 'APP_DELIVERY';
export type MarcaTarjeta = 'VISA' | 'MASTERCARD' | 'AMEX' | 'CABAL' | 'NARANJA' | 'OTRA';
export type ProcesadorPago = 'MP' | 'CLOVER' | 'OTRO';
export type EstadoCobro = 'PENDIENTE' | 'ACREDITADO' | 'PARCIAL' | 'CON_DIFERENCIA';

export type MedioPago = {
    id?: number;
    codigo: string;
    nombre: string;
    tipo: TipoCobro;
    cuotas: number;
    marcaTarjeta?: MarcaTarjeta;
    procesador?: ProcesadorPago;
    orden: number;
    activo?: number;
    arancel?: string;
    plazoDias?: number;
}

export type Cobro = {
    id?: number;
    ventaId: number;
    medioPagoId: number;
    tipo: TipoCobro;
    cuotas: number;
    marcaTarjeta?: MarcaTarjeta;
    procesador?: ProcesadorPago;
    monto: string;
    codigoAutorizacion?: string;
    ultimos4?: string;
    timestamp: string;
    estado: EstadoCobro;
    medioPago?: MedioPago;
}

export type CreateCobroPayload = {
    ventaId: number;
    medioPagoId: number;
    monto: string;
    codigoAutorizacion?: string;
    ultimos4?: string;
    vuelto?: string;
}

export type MetodoPago = {
    id?: number;
    nombre: string;
    tipo: 'efectivo' | 'tarjeta_credito' | 'tarjeta_debito' | 'transferencia' | 'qr' | 'otro';
    activo?: number;
    cuotas?: CuotaMetodoPago[];
}

export type VentaDetalle = {
    id?: number;
    ventaId?: number;
    articuloVarianteId: number;
    cantidad: string;
    precioUnitario: string;
    descuentoPorcentaje?: string;
    descuentoMonto?: string;
    subtotalLinea: string;
    articuloVariante?: ArticuloVariante;
}

export type VentaFormaPago = {
    id?: number;
    ventaId?: number;
    metodoPagoId: number;
    cuotaMetodoPagoId?: number;
    cantidadCuotas: number;
    tasaInteres: string;
    montoBase: string;
    montoConInteres: string;
    metodoPago?: MetodoPago;
    cuotaMetodoPago?: CuotaMetodoPago;
}

export type Comprobante = {
    id?: number;
    ventaId: number;
    tipo: 'fiscal' | 'manual';
    tipoComprobante: string;
    puntoVenta: string;
    numero?: number;
    fechaEmision?: string;
    cae?: string;
    caeVencimiento?: string;
    estado: 'pendiente' | 'pendiente_cae' | 'emitido' | 'anulado' | 'error';
    formatoDefault?: 'a4' | 'termica';
    datosArca?: string;
}

export type EstadoVenta = 'borrador' | 'confirmada' | 'anulada';

export type Venta = {
    id?: number;
    visitaId?: number;
    clienteId: number;
    vendedorId: number;
    listaPrecioId: number;
    tipoComprobante: string;
    estado?: EstadoVenta;
    fecha: string;
    subtotal: string;
    descuentoPorcentaje?: string;
    descuentoMonto?: string;
    recargoPorcentaje?: string;
    recargoMonto?: string;
    baseImponible: string;
    iva: string;
    total: string;
    cliente?: Cliente;
    vendedor?: Vendedor;
    listaPrecio?: ListaPrecio;
    usuarioId?: number;
    tipoOperacion?: TipoOperacionVenta;
    ventaOrigenId?: number;
    sesionCajaId?: number;
    vuelto?: string;
    detalles?: VentaDetalle[];
    cobros?: Cobro[];
    comprobante?: Comprobante;
}

export type MetricasDia = {
    entradas: number;
    compras: number;
    noCompras: number;
    pendientes: number;
    conversion: number;
}

export type DashboardRazon = {
    razon: RazonNoCompra;
    total: number;
    porcentaje: number;
    subRazones: { subRazon: SubRazonNoCompra; total: number; porcentaje: number }[];
}

export type DashboardTipo = {
    tipo: TipoVisitante;
    entradas: number;
    compras: number;
    noCompras: number;
    conversion: number;
    razonPrincipal?: RazonNoCompra;
}

export type DashboardConversion = {
    periodo: 'hoy' | 'semana' | 'mes';
    fechaDesde: string;
    fechaHasta: string;
    entradas: number;
    compras: number;
    noCompras: number;
    pendientes: number;
    conversion: number;
    razones: DashboardRazon[];
    tablaTipos: DashboardTipo[];
}

// --- Cajas ---
export type TipoOperacionVenta = 'venta' | 'nota_credito' | 'nota_debito';

export type Caja = {
    id?: number;
    nombre: string;
    descripcion?: string;
    activo?: number;
}

export type ConceptoMovimiento = {
    id?: number;
    nombre: string;
    tipo: 'ingreso' | 'egreso';
    esSistema?: number;
    activo?: number;
}

export type SesionCaja = {
    id?: number;
    cajaId: number;
    usuarioId?: number;
    estado?: 'abierta' | 'cerrada';
    fechaApertura?: string;
    fechaCierre?: string;
    saldoInicialSugerido?: string;
    saldoInicialConfirmado: string;
    sesionAnteriorId?: number;
    observaciones?: string;
    caja?: Caja;
    totalIngresos?: string;
    totalEgresos?: string;
    cantidadMovimientos?: number;
}

export type MovimientoCaja = {
    id?: number;
    sesionCajaId: number;
    tipo: 'ingreso' | 'egreso';
    conceptoMovimientoId?: number;
    medioPagoId?: number;
    monto: string;
    descripcion?: string;
    referenciaTipo?: string;
    referenciaId?: number;
    conceptoMovimiento?: ConceptoMovimiento;
    createdAt?: string;
}

export type ArqueoCajaDetalle = {
    id?: number;
    arqueoCajaId?: number;
    medioPagoId: number;
    montoSistema?: string;
    montoDeclarado: string;
    diferencia?: string;
}

export type ArqueoCaja = {
    id?: number;
    sesionCajaId: number;
    tipo: 'parcial' | 'cierre';
    fecha?: string;
    diferenciaTotal?: string;
    observaciones?: string;
    detalles: ArqueoCajaDetalle[];
}

export type AbrirCajaDto = {
    cajaId: number;
    saldoInicialConfirmado: string;
    observaciones?: string;
}

export type CerrarCajaDto = {
    observaciones?: string;
}
