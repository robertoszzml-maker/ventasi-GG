'use client'

import React from 'react'
import { PageTitle } from '@/components/ui/page-title'
import { useGetDashboardConversionQuery } from '@/hooks/visita'
import { DashboardRazon, DashboardTipo, TipoVisitante } from '@/types'
import { getTipoIcono, getTipoLabel, getTipoColor, getTipoBg } from '@/components/visitas/selector-tipo-visitante'
import { Users, ShoppingBag, TrendingUp, ChevronDown, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

type Periodo = 'hoy' | 'semana' | 'mes'

const PERIODOS: { value: Periodo; label: string }[] = [
  { value: 'hoy', label: 'Hoy' },
  { value: 'semana', label: 'Esta semana' },
  { value: 'mes', label: 'Este mes' },
]

function TogglePeriodo({ value, onChange }: { value: Periodo; onChange: (p: Periodo) => void }) {
  return (
    <div className="flex rounded-lg border overflow-hidden">
      {PERIODOS.map((p) => (
        <button
          key={p.value}
          onClick={() => onChange(p.value)}
          className={cn(
            'px-4 py-2 text-sm font-medium transition-colors',
            value === p.value
              ? 'bg-primary text-primary-foreground'
              : 'hover:bg-muted text-muted-foreground'
          )}
        >
          {p.label}
        </button>
      ))}
    </div>
  )
}

function CardsMetricas({ entradas, compras, conversion }: { entradas: number; compras: number; conversion: number }) {
  return (
    <div className="grid grid-cols-3 gap-4">
      {[
        { label: 'Entradas', value: entradas, icon: <Users className="h-5 w-5" />, color: 'text-blue-600' },
        { label: 'Compras', value: compras, icon: <ShoppingBag className="h-5 w-5" />, color: 'text-green-600' },
        { label: 'Conversión', value: `${conversion}%`, icon: <TrendingUp className="h-5 w-5" />, color: 'text-purple-600' },
      ].map((s) => (
        <div key={s.label} className="rounded-xl border bg-card p-5">
          <div className={cn('mb-2', s.color)}>{s.icon}</div>
          <p className="text-3xl font-bold">{s.value}</p>
          <p className="text-sm text-muted-foreground mt-1">{s.label}</p>
        </div>
      ))}
    </div>
  )
}

function TablaRazonesNoCompra({ razones }: { razones: DashboardRazon[] }) {
  const [expandidas, setExpandidas] = React.useState<Set<number>>(new Set())

  const toggleExpandir = (id: number) => {
    setExpandidas((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  if (!razones.length) {
    return <p className="text-sm text-muted-foreground py-4">Sin datos de no-compras en este período</p>
  }

  return (
    <div className="space-y-1">
      {razones.map(({ razon, total, porcentaje, subRazones }) => (
        <div key={razon.id}>
          <button
            onClick={() => subRazones.length && toggleExpandir(razon.id!)}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors text-left"
          >
            <span className="text-muted-foreground w-4">
              {subRazones.length
                ? expandidas.has(razon.id!)
                  ? <ChevronDown className="h-4 w-4" />
                  : <ChevronRight className="h-4 w-4" />
                : null}
            </span>
            <span className="flex-1 font-medium text-sm">{razon.nombre}</span>
            <div className="flex items-center gap-3">
              <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: `${porcentaje}%` }} />
              </div>
              <span className="text-sm text-muted-foreground w-10 text-right">{porcentaje}%</span>
              <span className="text-sm font-medium w-6 text-right">{total}</span>
            </div>
          </button>

          {expandidas.has(razon.id!) && subRazones.map(({ subRazon, total: sTotal, porcentaje: sPct }) => (
            <div key={subRazon.id} className="flex items-center gap-3 px-3 py-1.5 ml-8 text-sm text-muted-foreground">
              <span className="flex-1">↳ {subRazon.nombre}</span>
              <div className="flex items-center gap-3">
                <div className="w-32 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary/50 rounded-full" style={{ width: `${sPct}%` }} />
                </div>
                <span className="w-10 text-right">{sPct}%</span>
                <span className="w-6 text-right">{sTotal}</span>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

function CeldaTipo({ tipo }: { tipo: TipoVisitante }) {
  const Icono = getTipoIcono(tipo)
  return (
    <span className="flex items-center gap-2">
      <span className={cn('rounded-md p-1', getTipoBg(tipo))}>
        <Icono className={cn('h-3.5 w-3.5', getTipoColor(tipo))} strokeWidth={1.75} />
      </span>
      {getTipoLabel(tipo)}
    </span>
  )
}

function TablaCruzadaTipoVisitante({ tablaTipos }: { tablaTipos: DashboardTipo[] }) {
  if (!tablaTipos.length) {
    return <p className="text-sm text-muted-foreground py-4">Sin datos en este período</p>
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-muted-foreground border-b">
            <th className="pb-2 font-medium">Tipo</th>
            <th className="pb-2 font-medium text-right">Entradas</th>
            <th className="pb-2 font-medium text-right">Compras</th>
            <th className="pb-2 font-medium text-right">Conversión</th>
            <th className="pb-2 font-medium">Razón principal</th>
          </tr>
        </thead>
        <tbody>
          {tablaTipos.map((fila) => (
            <tr key={fila.tipo} className="border-b last:border-0">
              <td className="py-2.5">
                <CeldaTipo tipo={fila.tipo as TipoVisitante} />
              </td>
              <td className="py-2.5 text-right">{fila.entradas}</td>
              <td className="py-2.5 text-right text-green-600 font-medium">{fila.compras}</td>
              <td className="py-2.5 text-right font-bold">{fila.conversion}%</td>
              <td className="py-2.5 text-muted-foreground">{fila.razonPrincipal?.nombre ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function DashboardConversionPage() {
  const [periodo, setPeriodo] = React.useState<Periodo>('hoy')
  const { data } = useGetDashboardConversionQuery(periodo)

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <PageTitle title="Conversión del local" />
        <TogglePeriodo value={periodo} onChange={setPeriodo} />
      </div>

      <CardsMetricas
        entradas={data?.entradas ?? 0}
        compras={data?.compras ?? 0}
        conversion={data?.conversion ?? 0}
      />

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border bg-card p-5 space-y-3">
          <h3 className="font-semibold">Razones de no compra</h3>
          <TablaRazonesNoCompra razones={data?.razones ?? []} />
        </div>

        <div className="rounded-xl border bg-card p-5 space-y-3">
          <h3 className="font-semibold">Por tipo de visitante</h3>
          <TablaCruzadaTipoVisitante tablaTipos={data?.tablaTipos ?? []} />
        </div>
      </div>
    </div>
  )
}
