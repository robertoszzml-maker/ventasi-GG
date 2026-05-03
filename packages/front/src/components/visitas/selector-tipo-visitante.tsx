'use client'

import { cn } from '@/lib/utils'
import { TipoVisitante } from '@/types'
import { Check, UserRound, User, Glasses, GraduationCap, Heart, Home, Users } from 'lucide-react'
import { type LucideIcon } from 'lucide-react'

interface TipoConfig {
  valor: TipoVisitante
  etiqueta: string
  Icono: LucideIcon
  color: string
  bg: string
  activeBg: string
  activeBorder: string
  activeText: string
}

const TIPOS: TipoConfig[] = [
  {
    valor: 'MUJER',
    etiqueta: 'Mujer',
    Icono: UserRound,
    color: 'text-rose-500',
    bg: 'bg-rose-50',
    activeBg: 'bg-rose-50',
    activeBorder: 'border-rose-500',
    activeText: 'text-rose-700',
  },
  {
    valor: 'HOMBRE',
    etiqueta: 'Hombre',
    Icono: User,
    color: 'text-sky-500',
    bg: 'bg-sky-50',
    activeBg: 'bg-sky-50',
    activeBorder: 'border-sky-500',
    activeText: 'text-sky-700',
  },
  {
    valor: 'ADULTO_MAYOR',
    etiqueta: 'Adulto mayor',
    Icono: Glasses,
    color: 'text-slate-500',
    bg: 'bg-slate-50',
    activeBg: 'bg-slate-100',
    activeBorder: 'border-slate-500',
    activeText: 'text-slate-700',
  },
  {
    valor: 'JOVEN',
    etiqueta: 'Joven',
    Icono: GraduationCap,
    color: 'text-violet-500',
    bg: 'bg-violet-50',
    activeBg: 'bg-violet-50',
    activeBorder: 'border-violet-500',
    activeText: 'text-violet-700',
  },
  {
    valor: 'PAREJA',
    etiqueta: 'Pareja',
    Icono: Heart,
    color: 'text-pink-500',
    bg: 'bg-pink-50',
    activeBg: 'bg-pink-50',
    activeBorder: 'border-pink-500',
    activeText: 'text-pink-700',
  },
  {
    valor: 'FAMILIA',
    etiqueta: 'Familia',
    Icono: Home,
    color: 'text-emerald-500',
    bg: 'bg-emerald-50',
    activeBg: 'bg-emerald-50',
    activeBorder: 'border-emerald-500',
    activeText: 'text-emerald-700',
  },
  {
    valor: 'GRUPO',
    etiqueta: 'Grupo',
    Icono: Users,
    color: 'text-indigo-500',
    bg: 'bg-indigo-50',
    activeBg: 'bg-indigo-50',
    activeBorder: 'border-indigo-500',
    activeText: 'text-indigo-700',
  },
]

interface Props {
  value?: TipoVisitante
  onChange: (tipo: TipoVisitante) => void
}

export function SelectorTipoVisitante({ value, onChange }: Props) {
  return (
    <div className="grid grid-cols-4 gap-3">
      {TIPOS.map((tipo) => {
        const seleccionado = value === tipo.valor
        return (
          <button
            key={tipo.valor}
            type="button"
            onClick={() => onChange(tipo.valor)}
            className={cn(
              'relative flex flex-col items-center gap-2.5 rounded-2xl border-2 py-5 px-3',
              'transition-all duration-150 active:scale-95 touch-manipulation select-none cursor-pointer',
              seleccionado
                ? cn('border-2', tipo.activeBorder, tipo.activeBg, 'shadow-md')
                : 'border-border bg-card hover:border-muted-foreground/30'
            )}
            aria-pressed={seleccionado}
            aria-label={tipo.etiqueta}
          >
            {seleccionado && (
              <span className={cn(
                'absolute top-2 right-2 rounded-full p-0.5',
                tipo.activeBg
              )}>
                <Check className={cn('h-3 w-3', tipo.activeText)} strokeWidth={3} />
              </span>
            )}
            <span className={cn(
              'rounded-xl p-2.5',
              seleccionado ? tipo.bg : 'bg-muted/50'
            )}>
              <tipo.Icono
                className={cn('h-7 w-7', seleccionado ? tipo.color : 'text-muted-foreground')}
                strokeWidth={1.75}
              />
            </span>
            <span className={cn(
              'text-sm font-semibold text-center leading-tight',
              seleccionado ? tipo.activeText : 'text-foreground'
            )}>
              {tipo.etiqueta}
            </span>
          </button>
        )
      })}
    </div>
  )
}

export function getTipoLabel(tipo: TipoVisitante): string {
  return TIPOS.find((t) => t.valor === tipo)?.etiqueta ?? tipo
}

export function getTipoIcono(tipo: TipoVisitante): LucideIcon {
  return TIPOS.find((t) => t.valor === tipo)?.Icono ?? User
}

export function getTipoColor(tipo: TipoVisitante): string {
  return TIPOS.find((t) => t.valor === tipo)?.color ?? 'text-muted-foreground'
}

export function getTipoBg(tipo: TipoVisitante): string {
  return TIPOS.find((t) => t.valor === tipo)?.bg ?? 'bg-muted/50'
}
