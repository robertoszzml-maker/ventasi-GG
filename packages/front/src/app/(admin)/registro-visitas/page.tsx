'use client'

import React from 'react'
import { DialogNuevaVisita } from '@/components/visitas/dialog-nueva-visita'
import { ListaPendientes } from '@/components/visitas/lista-pendientes'
import { ModalNoCompra } from '@/components/visitas/modal-no-compra'
import { useGetMetricasDiaQuery } from '@/hooks/visita'
import {
  UserPlus,
  Users,
  ShoppingBag,
  XCircle,
  TrendingUp,
  Clock,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export default function RegistroVisitasPage() {
  const [dialogAbierto, setDialogAbierto] = React.useState(false)
  const [visitaNoCompraId, setVisitaNoCompraId] = React.useState<number | null>(null)
  const { data: m } = useGetMetricasDiaQuery()

  const hoy = new Date().toLocaleDateString('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

  return (
    <div className="flex flex-col gap-6 pb-8">

      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Registro de visitas</h1>
          <p className="text-sm text-muted-foreground capitalize mt-0.5">{hoy}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <StatCard
          label="Entradas"
          value={m?.entradas ?? 0}
          Icono={Users}
          iconColor="text-sky-500"
          iconBg="bg-sky-50"
        />
        <StatCard
          label="Compras"
          value={m?.compras ?? 0}
          Icono={ShoppingBag}
          iconColor="text-emerald-500"
          iconBg="bg-emerald-50"
        />
        <StatCard
          label="No compras"
          value={m?.noCompras ?? 0}
          Icono={XCircle}
          iconColor="text-red-500"
          iconBg="bg-red-50"
        />
        <StatCard
          label="Conversión"
          value={`${m?.conversion ?? 0}%`}
          Icono={TrendingUp}
          iconColor="text-violet-500"
          iconBg="bg-violet-50"
        />
        <StatCard
          label="Pendientes"
          value={m?.pendientes ?? 0}
          Icono={Clock}
          iconColor={m?.pendientes ? 'text-amber-600' : 'text-muted-foreground'}
          iconBg={m?.pendientes ? 'bg-amber-50' : 'bg-muted/50'}
          highlight={!!m?.pendientes}
          className="col-span-2 sm:col-span-1"
        />
      </div>

      {/* Botón principal */}
      <button
        onClick={() => setDialogAbierto(true)}
        className={cn(
          'w-full rounded-2xl bg-primary text-primary-foreground',
          'flex items-center justify-center gap-4 py-10',
          'active:scale-[0.99] transition-transform touch-manipulation select-none cursor-pointer',
          'shadow-lg shadow-primary/20 hover:bg-primary/90',
        )}
        aria-label="Registrar nueva entrada al local"
      >
        <UserPlus className="h-8 w-8 shrink-0" strokeWidth={2} />
        <span className="text-3xl font-bold">Entró alguien</span>
      </button>

      {/* Pendientes */}
      <div className="space-y-3">
        {!!m?.pendientes && (
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold">Por resolver</h2>
            <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2 py-0.5 rounded-full tabular-nums">
              {m.pendientes}
            </span>
          </div>
        )}
        <ListaPendientes onNoCompra={setVisitaNoCompraId} />
      </div>

      <DialogNuevaVisita open={dialogAbierto} onOpenChange={setDialogAbierto} />
      <ModalNoCompra visitaId={visitaNoCompraId} onClose={() => setVisitaNoCompraId(null)} />
    </div>
  )
}

interface StatCardProps {
  label: string
  value: string | number
  Icono: React.ElementType
  iconColor: string
  iconBg: string
  highlight?: boolean
  className?: string
}

function StatCard({ label, value, Icono, iconColor, iconBg, highlight = false, className }: StatCardProps) {
  return (
    <div className={cn(
      'rounded-2xl border px-4 py-4',
      highlight ? 'border-amber-200 bg-amber-50/60' : 'bg-card',
      className
    )}>
      <div className="flex items-center gap-2 mb-2">
        <span className={cn('rounded-lg p-1.5', iconBg)}>
          <Icono className={cn('h-4 w-4', iconColor)} />
        </span>
        <span className={cn('text-xs font-medium', highlight ? 'text-amber-600' : 'text-muted-foreground')}>
          {label}
        </span>
      </div>
      <p className={cn(
        'text-3xl font-black leading-none tabular-nums',
        highlight ? 'text-amber-700' : 'text-foreground'
      )}>
        {value}
      </p>
    </div>
  )
}
