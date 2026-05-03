'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Plus, ArrowLeft, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { VentaCabecera } from '@/components/venta/venta-cabecera';
import { VentaDetalleTabla } from '@/components/venta/venta-detalle-tabla';
import { VentaAgregarArticulo } from '@/components/venta/venta-agregar-articulo';
import { VentaTotalizador, calcularTotales } from '@/components/venta/venta-totalizador';
import { VentaFormasPago } from '@/components/venta/venta-formas-pago';
import { VentaAcciones } from '@/components/venta/venta-acciones';
import { useGetVentaByIdQuery, useGuardarVentaMutation } from '@/hooks/venta';
import { Venta, VentaDetalle } from '@/types';
import { cn } from '@/lib/utils';

const ESTADO_DOT: Record<string, string> = {
  borrador: 'bg-amber-400',
  confirmada: 'bg-emerald-500',
  anulada: 'bg-red-400',
};

const ESTADO_LABEL: Record<string, string> = {
  borrador: 'Borrador',
  confirmada: 'Confirmada',
  anulada: 'Anulada',
};

function PageSkeleton() {
  return (
    <div className="space-y-5 pb-8 animate-pulse">
      <div className="flex items-center gap-3">
        <Skeleton className="h-8 w-8 rounded-lg" />
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>
      <Skeleton className="h-[116px] w-full rounded-xl" />
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4 items-start">
        <div className="space-y-4">
          <Skeleton className="h-[200px] w-full rounded-xl" />
          <Skeleton className="h-[160px] w-full rounded-xl" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-[180px] w-full rounded-xl" />
          <Skeleton className="h-[140px] w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export default function VentaPage() {
  const { id } = useParams<{ id: string }>();
  const ventaId = parseInt(id);
  const router = useRouter();

  const { data: ventaApi, isLoading } = useGetVentaByIdQuery(ventaId);
  const { mutateAsync: guardarMutation } = useGuardarVentaMutation();

  const [ventaLocal, setVentaLocal] = React.useState<Partial<Venta>>({});
  const [detalles, setDetalles] = React.useState<VentaDetalle[]>([]);
  const [formasPago] = React.useState<never[]>([]);
  const [openAgregarArticulo, setOpenAgregarArticulo] = React.useState(false);
  const [initialized, setInitialized] = React.useState(false);

  React.useEffect(() => {
    if (ventaApi && !initialized) {
      setVentaLocal(ventaApi);
      setDetalles(ventaApi.detalles ?? []);
      setInitialized(true);
    }
  }, [ventaApi, initialized]);

  const readonly = ventaLocal.estado !== 'borrador' && !!ventaLocal.estado;

  const patchVenta = (patch: Partial<Venta>) => {
    setVentaLocal((prev) => ({ ...prev, ...patch }));
  };

  const handleUpdateDetalle = (index: number, patch: Partial<VentaDetalle>) => {
    setDetalles((prev) => prev.map((d, i) => (i === index ? { ...d, ...patch } : d)));
  };

  const handleRemoveDetalle = (index: number) => {
    setDetalles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddDetalle = (detalle: Omit<VentaDetalle, 'id' | 'ventaId'>) => {
    setDetalles((prev) => [...prev, detalle as VentaDetalle]);
  };

  const handleAddFormaPago = () => {};
  const handleRemoveFormaPago = (_index: number) => {};

  const buildVentaPayload = (): Venta => {
    const totales = calcularTotales(
      detalles,
      ventaLocal.descuentoPorcentaje ?? '',
      ventaLocal.descuentoMonto ?? '',
      ventaLocal.recargoPorcentaje ?? '',
      ventaLocal.recargoMonto ?? '',
    );

    return {
      ...ventaLocal,
      detalles,
      subtotal: totales.subtotal.toFixed(2),
      baseImponible: totales.baseImponible.toFixed(2),
      iva: totales.iva.toFixed(2),
      total: totales.total.toFixed(2),
    } as Venta;
  };

  const handleGuardar = async () => {
    await guardarMutation({ id: ventaId, data: buildVentaPayload() });
  };

  const { total } = calcularTotales(
    detalles,
    ventaLocal.descuentoPorcentaje ?? '',
    ventaLocal.descuentoMonto ?? '',
    ventaLocal.recargoPorcentaje ?? '',
    ventaLocal.recargoMonto ?? '',
  );

  const canConfirmar =
    !!ventaLocal.clienteId &&
    !!ventaLocal.vendedorId &&
    !!ventaLocal.listaPrecioId &&
    !!ventaLocal.tipoComprobante &&
    detalles.length > 0;

  if (isLoading) return <PageSkeleton />;

  const estado = ventaLocal.estado;

  return (
    <div className="space-y-5 pb-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0"
          onClick={() => router.push('/ventas')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-2 min-w-0">
          <button
            onClick={() => router.push('/ventas')}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            Ventas
          </button>
          <span className="text-muted-foreground/50 text-sm">/</span>
          <span className="text-sm font-semibold font-mono">#{String(ventaId).padStart(5, '0')}</span>
          {ventaLocal.fecha && (
            <span className="text-xs text-muted-foreground hidden sm:inline">· {ventaLocal.fecha}</span>
          )}
          {estado && (
            <span className={cn(
              'inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium',
              estado === 'borrador' ? 'bg-amber-50 text-amber-700 border-amber-200' :
              estado === 'confirmada' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
              'bg-red-50 text-red-700 border-red-200',
            )}>
              <span className={cn('h-1.5 w-1.5 rounded-full', ESTADO_DOT[estado] ?? 'bg-gray-400')} />
              {ESTADO_LABEL[estado] ?? estado}
            </span>
          )}
        </div>
      </div>

      {/* Cabecera */}
      <VentaCabecera venta={ventaLocal} onChange={patchVenta} readonly={readonly} />

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4 items-start">
        {/* Columna principal */}
        <div className="space-y-4">
          {/* Artículos header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-semibold">
                Artículos
                {detalles.length > 0 && (
                  <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                    ({detalles.length})
                  </span>
                )}
              </span>
            </div>
            {!readonly && (
              <Button onClick={() => setOpenAgregarArticulo(true)} size="sm" className="h-8">
                <Plus className="h-3.5 w-3.5 mr-1.5" />
                Agregar artículo
              </Button>
            )}
          </div>

          <VentaDetalleTabla
            detalles={detalles}
            onUpdate={handleUpdateDetalle}
            onRemove={handleRemoveDetalle}
            readonly={readonly}
          />

          <VentaTotalizador
            detalles={detalles}
            venta={ventaLocal}
            onChange={patchVenta}
            readonly={readonly}
          />
        </div>

        {/* Sidebar */}
        <div className="space-y-4 lg:sticky lg:top-4">
          <VentaFormasPago
            formasPago={formasPago}
            totalVenta={total}
            onAdd={handleAddFormaPago}
            onRemove={handleRemoveFormaPago}
            readonly={readonly}
          />

          <VentaAcciones
            venta={{ ...ventaLocal, detalles }}
            onGuardar={handleGuardar}
            canConfirmar={canConfirmar}
          />
        </div>
      </div>

      <VentaAgregarArticulo
        open={openAgregarArticulo}
        onClose={() => setOpenAgregarArticulo(false)}
        listaPrecioId={ventaLocal.listaPrecioId}
        onAgregar={handleAddDetalle}
      />
    </div>
  );
}
