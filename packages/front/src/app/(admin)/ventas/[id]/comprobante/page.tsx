'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Printer, Monitor } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ComprobanteA4 } from '@/components/venta/comprobante-a4';
import { ComprobanteTermica } from '@/components/venta/comprobante-termica';
import { useGetVentaByIdQuery } from '@/hooks/venta';
import { useGetConfigByKeyQuery } from '@/hooks/config';

export default function ComprobantePage() {
  const { id } = useParams<{ id: string }>();
  const ventaId = parseInt(id);
  const router = useRouter();

  const { data: venta, isLoading } = useGetVentaByIdQuery(ventaId);
  const { data: configFormato } = useGetConfigByKeyQuery('IMPRESION_FORMATO_DEFAULT');
  const [formato, setFormato] = React.useState<'a4' | 'termica'>('a4');

  React.useEffect(() => {
    const formatoConfig = (venta?.comprobante?.formatoDefault ?? configFormato?.valor ?? 'a4') as 'a4' | 'termica';
    setFormato(formatoConfig);
  }, [venta?.comprobante?.formatoDefault, configFormato?.valor]);

  const handlePrint = () => {
    window.open(`/print/ventas/${ventaId}?formato=${formato}`, '_blank');
  };

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-8 w-32 ml-auto rounded-lg" />
          <Skeleton className="h-8 w-24 rounded-lg" />
        </div>
        <Skeleton className="h-[600px] w-full max-w-2xl rounded-xl" />
      </div>
    );
  }

  if (!venta) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-3">
        <p className="font-medium">Venta no encontrada</p>
        <Button variant="outline" size="sm" onClick={() => router.push('/ventas')}>
          Volver a ventas
        </Button>
      </div>
    );
  }

  return (
    <>
      {/* Barra de controles */}
      <div className="flex items-center gap-3 mb-6 print:hidden">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>

        <div className="flex items-center gap-2 flex-1 min-w-0">
          <button
            onClick={() => router.push('/ventas')}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            Ventas
          </button>
          <span className="text-muted-foreground/50 text-sm">/</span>
          <button
            onClick={() => router.push(`/ventas/${ventaId}`)}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer font-mono"
          >
            #{String(ventaId).padStart(5, '0')}
          </button>
          <span className="text-muted-foreground/50 text-sm">/</span>
          <span className="text-sm font-semibold">Comprobante</span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Monitor className="h-3.5 w-3.5" />
          </div>
          <Select value={formato} onValueChange={(v) => setFormato(v as 'a4' | 'termica')}>
            <SelectTrigger className="w-36 h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="a4">A4 (210mm)</SelectItem>
              <SelectItem value="termica">Térmica (80mm)</SelectItem>
            </SelectContent>
          </Select>
          <Button size="sm" className="h-8 gap-2" onClick={handlePrint}>
            <Printer className="h-3.5 w-3.5" />
            Imprimir
          </Button>
        </div>
      </div>

      {/* Preview del comprobante */}
      <div className="comprobante-print">
        {formato === 'a4' ? (
          <ComprobanteA4 venta={venta} />
        ) : (
          <ComprobanteTermica venta={venta} />
        )}
      </div>
    </>
  );
}
