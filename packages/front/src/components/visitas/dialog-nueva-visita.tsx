'use client'

import React from 'react'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { LoadingButton } from '@/components/ui/loading-button'
import { SelectorTipoVisitante } from './selector-tipo-visitante'
import { SelectorCaracteristicas } from './selector-caracteristicas'
import { TipoVisitante } from '@/types'
import { useCreateVisitaMutation } from '@/hooks/visita'
import { useToast } from '@/hooks/use-toast'
import { X, UserPlus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DialogNuevaVisita({ open, onOpenChange }: Props) {
  const [tipo, setTipo] = React.useState<TipoVisitante | undefined>()
  const [caracteristicaIds, setCaracteristicaIds] = React.useState<number[]>([])
  const { mutateAsync: crearVisita, isPending } = useCreateVisitaMutation()
  const { toast } = useToast()

  const handleClose = () => {
    setTipo(undefined)
    setCaracteristicaIds([])
    onOpenChange(false)
  }

  const handleConfirmar = async () => {
    if (!tipo) return
    try {
      await crearVisita({ tipoVisitante: tipo, caracteristicaIds })
      toast({ title: '✓ Entrada registrada' })
      handleClose()
    } catch {
      toast({ title: 'Error al registrar entrada', variant: 'destructive' })
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden rounded-3xl gap-0">

        <DialogTitle className="sr-only">Registrar nueva entrada al local</DialogTitle>

        {/* Header */}
        <div className="bg-gradient-to-br from-indigo-500 to-indigo-700 px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-white/20 p-2.5">
              <UserPlus className="h-6 w-6 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-white font-black text-2xl leading-none">Nueva entrada</h2>
              <p className="text-indigo-200 text-sm font-medium mt-0.5">¿Quién entró al local?</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="rounded-full bg-white/20 p-2 hover:bg-white/30 transition-colors touch-manipulation"
          >
            <X className="h-5 w-5 text-white" />
          </button>
        </div>

        {/* Body */}
        <div className="px-8 py-6 space-y-7 bg-card">

          {/* Tipo — obligatorio */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-lg font-black">¿Quién es?</span>
              <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">Requerido</span>
            </div>
            <SelectorTipoVisitante value={tipo} onChange={setTipo} />
          </div>

          {/* Características — opcionales */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-lg font-black">Características</span>
              <span className="bg-slate-100 text-slate-500 text-xs font-bold px-2 py-0.5 rounded-full">Opcional</span>
            </div>
            <SelectorCaracteristicas value={caracteristicaIds} onChange={setCaracteristicaIds} />
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-5 border-t bg-muted/30 flex gap-3">
          <button
            onClick={handleClose}
            className="flex-1 py-4 rounded-2xl border-2 border-border bg-card font-bold text-base hover:bg-muted transition-colors touch-manipulation"
          >
            Cancelar
          </button>
          <LoadingButton
            loading={isPending}
            disabled={!tipo}
            onClick={handleConfirmar}
            className={cn(
              'flex-[2] py-4 rounded-2xl font-black text-xl h-auto',
              'bg-indigo-600 hover:bg-indigo-700 disabled:bg-muted',
              'shadow-lg shadow-indigo-200 transition-all',
              tipo && 'active:scale-[0.98]'
            )}
          >
            Registrar entrada
          </LoadingButton>
        </div>
      </DialogContent>
    </Dialog>
  )
}
