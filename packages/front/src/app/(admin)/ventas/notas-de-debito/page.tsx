'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageTitle } from '@/components/ui/page-title';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Eye, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { useGetVentasRawQuery } from '@/hooks/venta';
import { Venta } from '@/types';
import { formatMoney } from '@/utils/number';

const LIMIT = 20;

export default function NotasDebitoPage() {
  const router = useRouter();
  const [skip, setSkip] = useState(0);

  const { data: notas, isLoading } = useGetVentasRawQuery({
    filter: JSON.stringify({ tipoOperacion: 'nota_debito' }),
    order: JSON.stringify({ id: 'DESC' }),
    limit: LIMIT,
    skip,
  });

  return (
    <div className="p-6 space-y-6">
      <PageTitle title="Notas de Débito">
        <Button size="sm" onClick={() => router.push('/ventas/nueva')}>
          <Plus className="h-4 w-4 mr-2" /> Nueva ND
        </Button>
      </PageTitle>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
        </div>
      ) : !notas?.length ? (
        <p className="text-muted-foreground">No hay notas de débito registradas.</p>
      ) : (
        <div className="border rounded-lg divide-y">
          {notas.map((v: Venta) => (
            <div key={v.id} className="flex items-center justify-between px-4 py-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">ND #{v.id}</span>
                  <Badge
                    variant="outline"
                    className={v.estado === 'confirmada'
                      ? 'bg-green-50 text-green-700 border-green-200 text-xs'
                      : 'bg-amber-50 text-amber-700 border-amber-200 text-xs'
                    }
                  >
                    {v.estado}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {v.fecha} · {v.cliente?.nombre ?? `Cliente #${v.clienteId}`}
                  {v.ventaOrigenId && ` · Venta origen: #${v.ventaOrigenId}`}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-semibold text-green-600">+{formatMoney(parseFloat(v.total ?? '0'))}</span>
                <Button variant="ghost" size="icon" onClick={() => router.push(`/ventas/${v.id}`)}>
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" disabled={skip === 0} onClick={() => setSkip(Math.max(0, skip - LIMIT))}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm text-muted-foreground">Página {Math.floor(skip / LIMIT) + 1}</span>
        <Button variant="outline" size="sm" disabled={!notas || notas.length < LIMIT} onClick={() => setSkip(skip + LIMIT)}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
