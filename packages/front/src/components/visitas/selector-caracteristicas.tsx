'use client'

import { cn } from '@/lib/utils'
import { CaracteristicaVisitante } from '@/types'
import { useGetCaracteristicasActivasQuery } from '@/hooks/caracteristica-visitante'
import { IconoCaracteristica } from './icono-caracteristica'
import { Check } from 'lucide-react'

interface Props {
  value: number[]
  onChange: (ids: number[]) => void
}

export function SelectorCaracteristicas({ value, onChange }: Props) {
  const { data: caracteristicas = [] } = useGetCaracteristicasActivasQuery()

  const toggle = (id: number) => {
    if (value.includes(id)) {
      onChange(value.filter((v) => v !== id))
    } else {
      onChange([...value, id])
    }
  }

  if (!caracteristicas.length) return null

  return (
    <div className="flex flex-wrap gap-2.5">
      {caracteristicas.map((c: CaracteristicaVisitante) => {
        const seleccionado = value.includes(c.id!)
        return (
          <button
            key={c.id}
            type="button"
            onClick={() => toggle(c.id!)}
            className={cn(
              'inline-flex items-center gap-2 px-4 py-3 rounded-2xl border-2 text-base font-semibold',
              'transition-all duration-150 active:scale-95 touch-manipulation select-none cursor-pointer',
              seleccionado
                ? 'border-indigo-500 bg-indigo-50 text-indigo-800 shadow-sm'
                : 'border-border bg-card hover:border-indigo-300 text-foreground'
            )}
            aria-pressed={seleccionado}
          >
            <IconoCaracteristica nombre={c.icono} className="h-5 w-5 shrink-0" />
            <span>{c.nombre}</span>
            {seleccionado && (
              <Check className="h-4 w-4 text-indigo-500 shrink-0" strokeWidth={2.5} />
            )}
          </button>
        )
      })}
    </div>
  )
}
