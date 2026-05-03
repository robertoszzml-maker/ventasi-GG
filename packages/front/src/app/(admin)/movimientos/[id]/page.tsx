'use client'

import { PageTitle } from "@/components/ui/page-title"
import { useGetMovimientoInventarioByIdQuery } from '@/hooks/movimiento-inventario'
import React from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Printer } from 'lucide-react'
import Link from 'next/link'
import { MovimientoInventario, DetalleMovimiento } from '@/types'

const TIPO_LABELS: Record<string, string> = {
  INGRESO: 'Ingreso',
  EGRESO: 'Egreso',
  ARREGLO: 'Arreglo',
}

const getProcedencia = (m: MovimientoInventario): string => {
  if (m.procedenciaUbicacion) return `Ubicación: ${m.procedenciaUbicacion.nombre}`;
  if (m.procedenciaProveedor) return `Proveedor: ${m.procedenciaProveedor.nombre}`;
  if (m.procedenciaCliente) return `Cliente: ${m.procedenciaCliente.nombre}`;
  return '—';
}

const getDestino = (m: MovimientoInventario): string => {
  if (m.destinoUbicacion) return `Ubicación: ${m.destinoUbicacion.nombre}`;
  if (m.destinoProveedor) return `Proveedor: ${m.destinoProveedor.nombre}`;
  if (m.destinoCliente) return `Cliente: ${m.destinoCliente.nombre}`;
  return '—';
}

export default function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = React.use(params);
    const { data: movimiento, isLoading, isFetching } = useGetMovimientoInventarioByIdQuery(Number(id));
    if (isLoading || isFetching) return <>Cargando...</>
    if (!movimiento) return <>Movimiento no encontrado</>

    const tieneDetalles = (movimiento.detalles?.length ?? 0) > 0;

    return (
        <>
            <div className="flex items-center justify-between mb-4">
                <PageTitle title={`Movimiento #${movimiento.id}`} />
                {tieneDetalles && (
                    <Button asChild size="sm" variant="outline">
                        <Link href={`/etiquetas/preparar?movimientoId=${movimiento.id}`}>
                            <Printer className="h-4 w-4 mr-2" />
                            Imprimir etiquetas
                        </Link>
                    </Button>
                )}
            </div>

            <div className="space-y-6 max-w-3xl mt-0">
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <span className="text-muted-foreground">Tipo:</span>{' '}
                        <Badge variant="outline">{TIPO_LABELS[movimiento.tipo] || movimiento.tipo}</Badge>
                    </div>
                    <div>
                        <span className="text-muted-foreground">Fecha:</span>{' '}
                        <strong>{movimiento.fecha}</strong>
                    </div>
                    <div>
                        <span className="text-muted-foreground">Procedencia:</span>{' '}
                        {getProcedencia(movimiento)}
                    </div>
                    <div>
                        <span className="text-muted-foreground">Destino:</span>{' '}
                        {getDestino(movimiento)}
                    </div>
                    <div>
                        <span className="text-muted-foreground">Total:</span>{' '}
                        <strong>{movimiento.cantidadTotal} unidades</strong>
                    </div>
                    {movimiento.descripcion && (
                        <div className="col-span-2">
                            <span className="text-muted-foreground">Descripción:</span>{' '}
                            {movimiento.descripcion}
                        </div>
                    )}
                </div>

                <div>
                    <h3 className="font-medium mb-3">Detalle de artículos</h3>
                    <table className="w-full text-sm border border-border rounded-lg overflow-hidden">
                        <thead className="bg-muted/30">
                            <tr>
                                <th className="text-left px-3 py-2">Artículo</th>
                                <th className="text-left px-3 py-2">Talle</th>
                                <th className="text-left px-3 py-2">Color</th>
                                <th className="text-right px-3 py-2">Cantidad</th>
                                {movimiento.tipo === 'ARREGLO' && <>
                                    <th className="text-right px-3 py-2">Antes</th>
                                    <th className="text-right px-3 py-2">Después</th>
                                </>}
                            </tr>
                        </thead>
                        <tbody>
                            {(movimiento.detalles || []).map((d: DetalleMovimiento, i: number) => (
                                <tr key={i} className="border-t border-border/40">
                                    <td className="px-3 py-2">{d.articuloVariante?.articulo?.nombre || '—'}</td>
                                    <td className="px-3 py-2">{d.articuloVariante?.talle?.codigo || '—'}</td>
                                    <td className="px-3 py-2">{d.articuloVariante?.color?.nombre || '—'}</td>
                                    <td className="px-3 py-2 text-right">{d.cantidad}</td>
                                    {movimiento.tipo === 'ARREGLO' && <>
                                        <td className="px-3 py-2 text-right text-muted-foreground">{d.cantidadAnterior || '—'}</td>
                                        <td className="px-3 py-2 text-right">{d.cantidadNueva || '—'}</td>
                                    </>}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}
