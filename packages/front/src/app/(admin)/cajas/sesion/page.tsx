'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageTitle } from '@/components/ui/page-title';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  TrendingUp, TrendingDown, Plus, FileSearch, Lock, RefreshCw,
  ArrowUpCircle, ArrowDownCircle,
} from 'lucide-react';
import { useGetSesionCajaActivaQuery } from '@/hooks/sesion-caja';
import { useGetMovimientosCajaQuery } from '@/hooks/movimiento-caja';
import { MovimientoCaja } from '@/types';
import { formatMoney } from '@/utils/number';
import NuevoMovimientoModal from './NuevoMovimientoModal';

export default function SesionCajaPage() {
  const router = useRouter();
  const [showMovimiento, setShowMovimiento] = useState(false);
  const { data: sesion, isLoading } = useGetSesionCajaActivaQuery();
  const { data: movimientos } = useGetMovimientosCajaQuery({
    filter: sesion ? JSON.stringify({ sesionCajaId: sesion.id }) : undefined,
    order: JSON.stringify({ id: 'DESC' }),
    limit: 50,
  });

  if (isLoading) {
    return <div className="p-6"><Skeleton className="h-64 w-full" /></div>;
  }

  if (!sesion) {
    return (
      <div className="p-6">
        <PageTitle title="Sesión de Caja" />
        <p className="mt-4 text-muted-foreground">No hay sesión de caja abierta.</p>
        <Button className="mt-2" onClick={() => router.push('/cajas/apertura')}>Abrir Caja</Button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <PageTitle title="Sesión Activa">
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowMovimiento(true)}>
            <Plus className="h-4 w-4 mr-2" /> Movimiento manual
          </Button>
          <Button variant="outline" onClick={() => router.push('/cajas/arqueo/nuevo')}>
            <FileSearch className="h-4 w-4 mr-2" /> Arqueo parcial
          </Button>
          <Button variant="destructive" onClick={() => router.push('/cajas/cierre')}>
            <Lock className="h-4 w-4 mr-2" /> Cerrar Caja
          </Button>
        </div>
      </PageTitle>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Saldo inicial</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatMoney(parseFloat(sesion.saldoInicialConfirmado ?? '0'))}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-1">
              <TrendingUp className="h-4 w-4 text-green-600" /> Ingresos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">{formatMoney(parseFloat(sesion.totalIngresos ?? '0'))}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-1">
              <TrendingDown className="h-4 w-4 text-red-600" /> Egresos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">{formatMoney(parseFloat(sesion.totalEgresos ?? '0'))}</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-2">
        <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Movimientos</h3>
        {!movimientos?.length ? (
          <p className="text-muted-foreground text-sm">Sin movimientos registrados aún.</p>
        ) : (
          <div className="divide-y border rounded-lg">
            {movimientos.map((m: MovimientoCaja) => (
              <div key={m.id} className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  {m.tipo === 'ingreso' ? (
                    <ArrowUpCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <ArrowDownCircle className="h-5 w-5 text-red-600" />
                  )}
                  <div>
                    <p className="text-sm font-medium capitalize">
                      {m.conceptoMovimiento?.nombre ?? m.referenciaTipo ?? m.tipo}
                    </p>
                    {m.descripcion && (
                      <p className="text-xs text-muted-foreground">{m.descripcion}</p>
                    )}
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

      {showMovimiento && (
        <NuevoMovimientoModal
          sesionCajaId={sesion.id!}
          onClose={() => setShowMovimiento(false)}
        />
      )}
    </div>
  );
}
