'use client'

import { useGetMetricasDiaQuery } from '@/hooks/visita'
import { Users, ShoppingBag, TrendingUp, Clock } from 'lucide-react'

export function StatsDelDia() {
  const { data } = useGetMetricasDiaQuery()

  const stats = [
    {
      label: 'Entradas',
      value: data?.entradas ?? 0,
      icon: <Users className="h-4 w-4" />,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: 'Compras',
      value: data?.compras ?? 0,
      icon: <ShoppingBag className="h-4 w-4" />,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      label: 'Conversión',
      value: `${data?.conversion ?? 0}%`,
      icon: <TrendingUp className="h-4 w-4" />,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
    {
      label: 'Pendientes',
      value: data?.pendientes ?? 0,
      icon: <Clock className="h-4 w-4" />,
      color: data?.pendientes ? 'text-amber-600' : 'text-muted-foreground',
      bg: data?.pendientes ? 'bg-amber-50' : 'bg-muted',
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {stats.map((s) => (
        <div key={s.label} className="rounded-lg border bg-card px-4 py-3">
          <div className="flex items-center gap-2 mb-1">
            <span className={`${s.color} ${s.bg} p-1 rounded`}>{s.icon}</span>
            <span className="text-xs text-muted-foreground">{s.label}</span>
          </div>
          <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
        </div>
      ))}
    </div>
  )
}
