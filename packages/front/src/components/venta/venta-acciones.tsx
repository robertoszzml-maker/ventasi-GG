'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { LoadingButton } from '@/components/ui/loading-button';
import { Save, CheckCircle, FileText, Receipt, RotateCcw, XCircle, Printer, Zap } from 'lucide-react';
import { Venta } from '@/types';
import {
  useGuardarVentaMutation,
  useConfirmarVentaMutation,
  useEmitirManualMutation,
  useEmitirFiscalMutation,
  useReintentarMutation,
  useAnularVentaMutation,
} from '@/hooks/venta';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { hasPermission } from '@/hooks/use-access';
import { PERMISOS } from '@/constants/permisos';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';

const ESTADO_CONFIG: Record<string, { label: string; dot: string; bg: string; text: string; border: string }> = {
  borrador: {
    label: 'Borrador',
    dot: 'bg-amber-400',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
  },
  confirmada: {
    label: 'Confirmada',
    dot: 'bg-emerald-500',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
  },
  anulada: {
    label: 'Anulada',
    dot: 'bg-red-400',
    bg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-200',
  },
};

const COMPROBANTE_ESTADO_LABEL: Record<string, string> = {
  pendiente: 'Pendiente',
  pendiente_cae: 'CAE pendiente',
  emitido: 'Emitido',
  anulado: 'Anulado',
  error: 'Error al emitir',
};

interface VentaAccionesProps {
  venta: Partial<Venta>;
  onGuardar: () => Promise<void>;
  canConfirmar: boolean;
}

export function VentaAcciones({ venta, onGuardar, canConfirmar }: VentaAccionesProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [confirmDialog, setConfirmDialog] = React.useState<'anular' | null>(null);

  const { mutateAsync: guardar, isPending: guardando } = useGuardarVentaMutation();
  const { mutateAsync: confirmar, isPending: confirmando } = useConfirmarVentaMutation();
  const { mutateAsync: emitirManual, isPending: emitiendoManual } = useEmitirManualMutation();
  const { mutateAsync: emitirFiscal, isPending: emitiendoFiscal } = useEmitirFiscalMutation();
  const { mutateAsync: reintentar, isPending: reintentando } = useReintentarMutation();
  const { mutateAsync: anular, isPending: anulando } = useAnularVentaMutation();

  const puedeConfirmar = hasPermission(PERMISOS.VENTA_CONFIRMAR);
  const puedeEmitirManual = hasPermission(PERMISOS.COMPROBANTE_EMITIR_MANUAL);
  const puedeEmitirFiscal = hasPermission(PERMISOS.COMPROBANTE_EMITIR_FISCAL);
  const puedeAnular = hasPermission(PERMISOS.VENTA_ANULAR);
  const puedeImprimir = hasPermission(PERMISOS.COMPROBANTE_IMPRIMIR);

  const estado = venta.estado;
  const comprobante = venta.comprobante;
  const ventaId = venta.id!;
  const estadoCfg = ESTADO_CONFIG[estado ?? ''];

  const handleGuardar = async () => {
    try {
      await onGuardar();
      toast({ title: 'Borrador guardado' });
    } catch {
      toast({ title: 'Error al guardar', variant: 'destructive' });
    }
  };

  const handleConfirmar = async () => {
    try {
      await confirmar(ventaId);
      toast({ title: 'Venta confirmada' });
    } catch {
      toast({ title: 'Error al confirmar la venta', variant: 'destructive' });
    }
  };

  const handleEmitirManual = async () => {
    try {
      await emitirManual({ id: ventaId, formato: 'a4' });
      toast({ title: 'Comprobante manual emitido' });
      router.push(`/ventas/${ventaId}/comprobante`);
    } catch {
      toast({ title: 'Error al emitir comprobante manual', variant: 'destructive' });
    }
  };

  const handleEmitirFiscal = async () => {
    try {
      await emitirFiscal({ id: ventaId, formato: 'a4' });
      toast({ title: 'Comprobante fiscal emitido' });
      router.push(`/ventas/${ventaId}/comprobante`);
    } catch {
      toast({ title: 'Error al emitir comprobante fiscal', variant: 'destructive' });
    }
  };

  const handleReintentar = async () => {
    try {
      await reintentar(ventaId);
      toast({ title: 'Reintento enviado' });
    } catch {
      toast({ title: 'Error al reintentar', variant: 'destructive' });
    }
  };

  const handleAnular = async () => {
    try {
      await anular(ventaId);
      toast({ title: 'Venta anulada' });
      setConfirmDialog(null);
    } catch {
      toast({ title: 'Error al anular la venta', variant: 'destructive' });
    }
  };

  return (
    <>
      <AlertDialog open={confirmDialog === 'anular'} onOpenChange={(v) => !v && setConfirmDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Anular esta venta?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se anulará la venta y su comprobante si existe.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleAnular}
            >
              Anular
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        {/* Header con estado */}
        <div className="px-4 py-2.5 border-b bg-muted/20 flex items-center justify-between">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Acciones</p>
          {estado && estadoCfg && (
            <span className={cn(
              'inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium',
              estadoCfg.bg, estadoCfg.text, estadoCfg.border,
            )}>
              <span className={cn('h-1.5 w-1.5 rounded-full', estadoCfg.dot)} />
              {estadoCfg.label}
            </span>
          )}
        </div>

        <div className="p-4 space-y-3">
          {/* Info comprobante */}
          {comprobante && (
            <div className="rounded-lg bg-muted/30 border divide-y text-xs">
              <div className="flex justify-between items-center px-3 py-2">
                <span className="text-muted-foreground">Comprobante</span>
                <span className="font-medium capitalize">{comprobante.tipo}</span>
              </div>
              <div className="flex justify-between items-center px-3 py-2">
                <span className="text-muted-foreground">Estado</span>
                <span className={cn(
                  'font-medium',
                  comprobante.estado === 'emitido' ? 'text-emerald-600' :
                  comprobante.estado === 'pendiente_cae' ? 'text-amber-600' :
                  comprobante.estado === 'anulado' ? 'text-red-600' : '',
                )}>
                  {COMPROBANTE_ESTADO_LABEL[comprobante.estado] ?? comprobante.estado}
                </span>
              </div>
              {comprobante.numero && (
                <div className="flex justify-between items-center px-3 py-2">
                  <span className="text-muted-foreground">Número</span>
                  <span className="font-mono font-medium">
                    {comprobante.puntoVenta}-{String(comprobante.numero).padStart(8, '0')}
                  </span>
                </div>
              )}
              {comprobante.cae && (
                <div className="flex justify-between items-center px-3 py-2 gap-2">
                  <span className="text-muted-foreground shrink-0">CAE</span>
                  <span className="font-mono text-xs truncate">{comprobante.cae}</span>
                </div>
              )}
            </div>
          )}

          {/* Botones de acción */}
          <div className="space-y-2">
            {estado === 'borrador' && (
              <>
                <LoadingButton
                  variant="outline"
                  className="w-full justify-start h-9 text-sm"
                  loading={guardando}
                  onClick={handleGuardar}
                >
                  <Save className="h-4 w-4 mr-2 shrink-0" />
                  Guardar borrador
                </LoadingButton>

                {puedeConfirmar && (
                  <LoadingButton
                    className="w-full justify-start h-9 text-sm"
                    loading={confirmando}
                    disabled={!canConfirmar}
                    onClick={handleConfirmar}
                  >
                    <CheckCircle className="h-4 w-4 mr-2 shrink-0" />
                    Confirmar venta
                  </LoadingButton>
                )}

                {!canConfirmar && (
                  <p className="text-xs text-muted-foreground text-center">
                    Completá todos los campos y al menos un artículo
                  </p>
                )}
              </>
            )}

            {estado === 'confirmada' && !comprobante && (
              <>
                {puedeEmitirManual && (
                  <LoadingButton
                    variant="outline"
                    className="w-full justify-start h-9 text-sm"
                    loading={emitiendoManual}
                    onClick={handleEmitirManual}
                  >
                    <FileText className="h-4 w-4 mr-2 shrink-0" />
                    Emitir manual
                  </LoadingButton>
                )}

                {puedeEmitirFiscal && (
                  <LoadingButton
                    className="w-full justify-start h-9 text-sm"
                    loading={emitiendoFiscal}
                    onClick={handleEmitirFiscal}
                  >
                    <Zap className="h-4 w-4 mr-2 shrink-0" />
                    Emitir fiscal ARCA
                  </LoadingButton>
                )}
              </>
            )}

            {comprobante?.estado === 'pendiente_cae' && (
              <LoadingButton
                variant="outline"
                className="w-full justify-start h-9 text-sm text-amber-600 border-amber-200 hover:bg-amber-50"
                loading={reintentando}
                onClick={handleReintentar}
              >
                <RotateCcw className="h-4 w-4 mr-2 shrink-0" />
                Reintentar CAE
              </LoadingButton>
            )}

            {comprobante?.estado === 'emitido' && puedeImprimir && (
              <Button
                variant="outline"
                className="w-full justify-start h-9 text-sm"
                onClick={() => router.push(`/ventas/${ventaId}/comprobante`)}
              >
                <Printer className="h-4 w-4 mr-2 shrink-0" />
                Ver e imprimir
              </Button>
            )}

            {estado !== 'anulada' && puedeAnular && (
              <LoadingButton
                variant="ghost"
                className="w-full justify-start h-9 text-sm text-destructive hover:text-destructive hover:bg-destructive/5"
                loading={anulando}
                onClick={() => setConfirmDialog('anular')}
              >
                <XCircle className="h-4 w-4 mr-2 shrink-0" />
                Anular
              </LoadingButton>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
