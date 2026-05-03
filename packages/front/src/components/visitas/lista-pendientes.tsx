'use client'

import { useGetVisitasPendientesQuery } from '@/hooks/visita'
import { Visita } from '@/types'
import { getTipoLabel, getTipoIcono, getTipoColor, getTipoBg } from './selector-tipo-visitante'
import { CheckCircle2, Clock, XCircle } from 'lucide-react'
import { IconoCaracteristica } from './icono-caracteristica'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

interface Props {
  onNoCompra: (visitaId: number) => void
}

export function ListaPendientes({ onNoCompra }: Props) {
  const { data: pendientes = [] } = useGetVisitasPendientesQuery()
  const router = useRouter()

  if (!pendientes.length) {
    return (
      <div className="rounded-2xl border border-dashed py-14 flex flex-col items-center gap-3 text-muted-foreground">
        <Clock className="h-10 w-10 opacity-25" />
        <p className="text-base font-medium">Sin visitas pendientes</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {pendientes.map((visita: Visita) => {
        const TipoIcono = getTipoIcono(visita.tipoVisitante)
        const tipoColor = getTipoColor(visita.tipoVisitante)
        const tipoBg = getTipoBg(visita.tipoVisitante)

        return (
          <div key={visita.id} className="rounded-2xl border bg-card overflow-hidden shadow-sm">

            {/* Info visitante */}
            <div className="flex items-center gap-4 px-5 py-4">
              <div className={cn(
                'w-14 h-14 rounded-2xl flex items-center justify-center shrink-0',
                tipoBg
              )}>
                <TipoIcono className={cn('h-7 w-7', tipoColor)} strokeWidth={1.75} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-lg leading-tight">{getTipoLabel(visita.tipoVisitante)}</p>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="h-3.5 w-3.5 shrink-0" />
                    {visita.hora}
                  </span>
                  {visita.caracteristicas?.map((c) => (
                    <span
                      key={c.id}
                      className="inline-flex items-center gap-1 text-xs bg-muted/60 text-muted-foreground px-2 py-0.5 rounded-full"
                    >
                      <IconoCaracteristica nombre={c.icono} className="h-3 w-3" />
                      {c.nombre}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Acciones */}
            <div className="grid grid-cols-2 border-t">
              <button
                onClick={() => {
                  const params = new URLSearchParams({ visitaId: String(visita.id) });
                  if (visita.clienteId) params.set('clienteId', String(visita.clienteId));
                  router.push(`/ventas/nueva?${params.toString()}`);
                }}
                className={cn(
                  'flex items-center justify-center gap-2.5 py-5',
                  'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800',
                  'active:scale-[0.98] transition-all touch-manipulation select-none cursor-pointer',
                  'border-r border-emerald-500'
                )}
                aria-label="Registrar compra"
              >
                <CheckCircle2 className="h-5 w-5 text-white" strokeWidth={2} />
                <span className="text-white font-bold text-xl">Compró</span>
              </button>
              <button
                onClick={() => onNoCompra(visita.id!)}
                className={cn(
                  'flex items-center justify-center gap-2.5 py-5',
                  'bg-red-600 hover:bg-red-700 active:bg-red-800',
                  'active:scale-[0.98] transition-all touch-manipulation select-none cursor-pointer'
                )}
                aria-label="Registrar no compra"
              >
                <XCircle className="h-5 w-5 text-white" strokeWidth={2} />
                <span className="text-white font-bold text-xl">No compró</span>
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
