'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { PageTitle } from '@/components/ui/page-title';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { useGetSesionCajaByIdQuery } from '@/hooks/sesion-caja';
import { formatMoney } from '@/utils/number';
import { MovimientoCaja } from '@/types';

export default function DetalleSesionPage() {
  const router = useRouter();
  const params = useParams();
  const id = parseInt(params.id as string);

  const { data: sesion, isLoading } = useGetSesionCajaByIdQuery(id);

  if (isLoading) return <div className="p-6"><Skeleton className="h-64 w-full" /></div>;
  if (!sesion) return <div className="p-6"><p>Sesión no encontrada.</p></div>;

  return (
    <div className="p-6 space-y-6">
      <PageTitle title={`Sesión #${sesion.id}`}>
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Volver
        </Button>
      </PageTitle>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Apertura</CardTitle></CardHeader>
          <CardContent>
            <p className="font-medium">{sesion.fechaApertura ? new Date(sesion.fechaApertura).toLocaleString('es-AR') : '-'}</p>
            <p className="text-sm text-muted-foreground">Saldo: {formatMoney(parseFloat(sesion.saldoInicialConfirmado ?? '0'))}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Cierre</CardTitle></CardHeader>
          <CardContent>
            <p className="font-medium">{sesion.fechaCierre ? new Date(sesion.fechaCierre).toLocaleString('es-AR') : 'Sesión abierta'}</p>
            <Badge variant="outline" className={sesion.estado === 'abierta' ? 'bg-green-50 text-green-700 border-green-200' : ''}>
              {sesion.estado}
            </Badge>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-2">
        <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Movimientos</h3>
        {!(sesion as any).movimientos?.length ? (
          <p className="text-sm text-muted-foreground">Sin movimientos.</p>
        ) : (
          <div className="divide-y border rounded-lg">
            {((sesion as any).movimientos as MovimientoCaja[]).map((m) => (
              <div key={m.id} className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  {m.tipo === 'ingreso'
                    ? <ArrowUpCircle className="h-5 w-5 text-green-600" />
                    : <ArrowDownCircle className="h-5 w-5 text-red-600" />
                  }
                  <div>
                    <p className="text-sm font-medium capitalize">
                      {m.conceptoMovimiento?.nombre ?? m.referenciaTipo ?? m.tipo}
                    </p>
                    {m.descripcion && <p className="text-xs text-muted-foreground">{m.descripcion}</p>}
                  </div>
                </div>
                <span className={`font-semibold ${m.tipo === 'ingreso' ? 'text-green-600' : 'text-red-600'}`}>
                  {m.tipo === 'egreso' ? '-' : '+'}{formatMoney(parseFloat(m.monto ?? '0'))}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
