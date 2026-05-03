'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { PageTitle } from '@/components/ui/page-title';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Lock, Unlock, TrendingUp, TrendingDown, Package, History } from 'lucide-react';
import { useGetSesionCajaActivaQuery } from '@/hooks/sesion-caja';
import { formatMoney } from '@/utils/number';

export default function CajasPage() {
  const router = useRouter();
  const { data: sesion, isLoading } = useGetSesionCajaActivaQuery();

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  const cajaAbierta = !!sesion;

  return (
    <div className="p-6 space-y-6">
      <PageTitle title="Caja">
        {cajaAbierta && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.push('/cajas/historial')}>
              <History className="h-4 w-4 mr-2" />
              Historial
            </Button>
            <Button variant="destructive" onClick={() => router.push('/cajas/cierre')}>
              <Lock className="h-4 w-4 mr-2" />
              Cerrar Caja
            </Button>
          </div>
        )}
      </PageTitle>

      {!cajaAbierta ? (
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <div className="rounded-full bg-muted p-6">
            <Lock className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold">Caja Cerrada</h3>
          <p className="text-muted-foreground text-center max-w-sm">
            No hay ninguna sesión de caja abierta. Abrí la caja para comenzar a operar.
          </p>
          <Button size="lg" onClick={() => router.push('/cajas/apertura')}>
            <Unlock className="h-4 w-4 mr-2" />
            Abrir Caja
          </Button>
          <Button variant="ghost" onClick={() => router.push('/cajas/historial')}>
            <History className="h-4 w-4 mr-2" />
            Ver historial de sesiones
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 px-3 py-1">
              <span className="w-2 h-2 rounded-full bg-green-500 mr-2 inline-block" />
              Caja Abierta
            </Badge>
            <span className="text-sm text-muted-foreground">
              Desde {sesion.fechaApertura ? new Date(sesion.fechaApertura).toLocaleString('es-AR') : '-'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Saldo inicial</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{formatMoney(parseFloat(sesion.saldoInicialConfirmado ?? '0'))}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                  <TrendingUp className="h-4 w-4 text-green-600" /> Ingresos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-green-600">{formatMoney(parseFloat(sesion.totalIngresos ?? '0'))}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                  <TrendingDown className="h-4 w-4 text-red-600" /> Egresos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-red-600">{formatMoney(parseFloat(sesion.totalEgresos ?? '0'))}</p>
              </CardContent>
            </Card>
          </div>

          <div className="flex gap-2 flex-wrap">
            <Button onClick={() => router.push('/cajas/sesion')}>
              <Package className="h-4 w-4 mr-2" />
              Ver sesión activa
            </Button>
            <Button variant="outline" onClick={() => router.push('/cajas/arqueo/nuevo')}>
              Arqueo parcial
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
