'use client';

import React from 'react';
import Link from 'next/link';
import { Plus, CreditCard, Banknote, ArrowLeftRight, QrCode, Wallet, Smartphone, MoreHorizontal, Pencil, PowerOff } from 'lucide-react';
import { PageTitle } from '@/components/ui/page-title';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useGetMediosPagoQuery, useEditMedioPagoMutation } from '@/hooks/medio-pago';
import { useToast } from '@/hooks/use-toast';
import { MedioPago, TipoCobro } from '@/types';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

const TIPO_CONFIG: Record<TipoCobro, { label: string; icon: React.ElementType; bg: string; text: string }> = {
  EFECTIVO:     { label: 'Efectivo',      icon: Banknote,       bg: 'bg-emerald-100', text: 'text-emerald-700' },
  DEBITO:       { label: 'Débito',        icon: CreditCard,     bg: 'bg-blue-100',    text: 'text-blue-700'    },
  CREDITO:      { label: 'Crédito',       icon: CreditCard,     bg: 'bg-violet-100',  text: 'text-violet-700'  },
  QR:           { label: 'QR',            icon: QrCode,         bg: 'bg-amber-100',   text: 'text-amber-700'   },
  TRANSFERENCIA:{ label: 'Transferencia', icon: ArrowLeftRight, bg: 'bg-sky-100',     text: 'text-sky-700'     },
  APP_DELIVERY: { label: 'App Delivery',  icon: Smartphone,     bg: 'bg-orange-100',  text: 'text-orange-700'  },
};

function CardSkeleton() {
  return (
    <div className="rounded-xl border bg-card p-4 space-y-3">
      <div className="flex items-start gap-3">
        <Skeleton className="h-9 w-9 rounded-lg" />
        <div className="flex-1 space-y-1.5">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-20" />
        </div>
        <Skeleton className="h-5 w-12 rounded-full" />
      </div>
    </div>
  );
}

function MedioPagoCard({ medio, onToggle }: { medio: MedioPago; onToggle: () => void }) {
  const router = useRouter();
  const tipoCfg = TIPO_CONFIG[medio.tipo] ?? TIPO_CONFIG['EFECTIVO'];
  const Icon = tipoCfg.icon;

  return (
    <div className={cn(
      'group rounded-xl border bg-card p-4 space-y-3 shadow-sm transition-shadow hover:shadow-md',
      !medio.activo && 'opacity-50',
    )}>
      <div className="flex items-start gap-3">
        <div className={cn('h-9 w-9 rounded-lg flex items-center justify-center shrink-0', tipoCfg.bg)}>
          <Icon className={cn('h-4 w-4', tipoCfg.text)} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-sm">{medio.codigo}</span>
            <span className="text-sm font-medium truncate">{medio.nombre}</span>
          </div>
          <p className="text-xs text-muted-foreground">{tipoCfg.label}</p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className={cn(
            'inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium',
            medio.activo
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-gray-50 text-gray-500 border-gray-200',
          )}>
            <span className={cn('mr-1 h-1.5 w-1.5 rounded-full', medio.activo ? 'bg-emerald-500' : 'bg-gray-400')} />
            {medio.activo ? 'Activo' : 'Inactivo'}
          </span>
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreHorizontal className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => router.push(`/config/metodos-pago/${medio.id}`)}>
                <Pencil className="h-3.5 w-3.5 mr-2" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onToggle} className={medio.activo ? 'text-destructive focus:text-destructive' : ''}>
                <PowerOff className="h-3.5 w-3.5 mr-2" />
                {medio.activo ? 'Desactivar' : 'Activar'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {medio.cuotas > 1 && (
          <Badge variant="secondary" className="text-xs">{medio.cuotas} cuotas</Badge>
        )}
        {medio.marcaTarjeta && (
          <Badge variant="outline" className="text-xs font-mono">{medio.marcaTarjeta}</Badge>
        )}
        {medio.procesador && (
          <Badge variant="outline" className="text-xs">{medio.procesador}</Badge>
        )}
        <span className="ml-auto text-xs text-muted-foreground">orden {medio.orden}</span>
      </div>
    </div>
  );
}

export default function MediosPagoPage() {
  const { data: medios = [], isLoading } = useGetMediosPagoQuery({ pagination: { pageIndex: 0, pageSize: 100 } });
  const { mutate: editar } = useEditMedioPagoMutation();
  const { toast } = useToast();

  const toggleActivo = (medio: MedioPago) => {
    editar(
      { id: medio.id!, data: { activo: medio.activo ? 0 : 1 } },
      {
        onSuccess: () => toast({ description: medio.activo ? 'Medio desactivado' : 'Medio activado' }),
        onError: () => toast({ description: 'No se pudo actualizar', variant: 'destructive' }),
      },
    );
  };

  const activos = medios.filter((m) => m.activo);
  const inactivos = medios.filter((m) => !m.activo);

  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-center justify-between">
        <PageTitle title="Medios de pago" />
        <Button asChild size="sm">
          <Link href="/config/metodos-pago/crear">
            <Plus className="h-4 w-4 mr-2" />
            Nuevo medio
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : medios.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-3">
          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
            <CreditCard className="h-5 w-5 opacity-40" />
          </div>
          <p className="font-medium">No hay medios de pago configurados</p>
          <Button asChild variant="outline" size="sm">
            <Link href="/config/metodos-pago/crear">Crear el primero</Link>
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {activos.map((m) => (
              <MedioPagoCard key={m.id} medio={m} onToggle={() => toggleActivo(m)} />
            ))}
          </div>
          {inactivos.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Inactivos</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {inactivos.map((m) => (
                  <MedioPagoCard key={m.id} medio={m} onToggle={() => toggleActivo(m)} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
