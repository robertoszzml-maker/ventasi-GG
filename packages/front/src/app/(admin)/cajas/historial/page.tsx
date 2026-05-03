'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageTitle } from '@/components/ui/page-title';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { useGetSesionesCajaQuery } from '@/hooks/sesion-caja';
import { SesionCaja } from '@/types';
import { formatMoney } from '@/utils/number';

const LIMIT = 20;

export default function HistorialCajaPage() {
  const router = useRouter();
  const [skip, setSkip] = useState(0);

  const { data: sesiones, isLoading } = useGetSesionesCajaQuery({
    limit: LIMIT,
    skip,
    order: JSON.stringify({ id: 'DESC' }),
  });

  return (
    <div className="p-6 space-y-6">
      <PageTitle title="Historial de Cajas" />

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
        </div>
      ) : !sesiones?.length ? (
        <p className="text-muted-foreground">No hay sesiones registradas.</p>
      ) : (
        <div className="border rounded-lg divide-y">
          {sesiones.map((s: SesionCaja) => (
            <div key={s.id} className="flex items-center justify-between px-4 py-3">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className={s.estado === 'abierta'
                      ? 'bg-green-50 text-green-700 border-green-200'
                      : 'bg-gray-50 text-gray-600 border-gray-200'
                    }
                  >
                    {s.estado === 'abierta' ? 'Abierta' : 'Cerrada'}
                  </Badge>
                  <span className="text-sm font-medium">
                    {s.fechaApertura ? new Date(s.fechaApertura).toLocaleDateString('es-AR') : '-'}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Saldo inicial: {formatMoney(parseFloat(s.saldoInicialConfirmado ?? '0'))}
                  {s.fechaCierre && ` · Cierre: ${new Date(s.fechaCierre).toLocaleTimeString('es-AR')}`}
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => router.push(`/cajas/historial/${s.id}`)}>
                <Eye className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" disabled={skip === 0} onClick={() => setSkip(Math.max(0, skip - LIMIT))}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm text-muted-foreground">Página {Math.floor(skip / LIMIT) + 1}</span>
        <Button variant="outline" size="sm" disabled={!sesiones || sesiones.length < LIMIT} onClick={() => setSkip(skip + LIMIT)}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
