'use client'

import React from 'react'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { LoadingButton } from '@/components/ui/loading-button'
import { Combobox } from '@/components/ui/combobox'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useGetRazonesActivasQuery } from '@/hooks/razon-no-compra'
import { useGetArticulosQuery } from '@/hooks/articulos'
import { useGetClientesQuery } from '@/hooks/cliente'
import { useResolverNoCompraMutation } from '@/hooks/visita'
import { useToast } from '@/hooks/use-toast'
import { XCircle, X, Check } from 'lucide-react'
import { RazonNoCompra, SubRazonNoCompra } from '@/types'
import { cn } from '@/lib/utils'

const PAGINACION_BASE = { pagination: { pageIndex: 0, pageSize: 500 } }

interface Props {
  visitaId: number | null
  onClose: () => void
}

export function ModalNoCompra({ visitaId, onClose }: Props) {
  const [razonId, setRazonId] = React.useState<number | null>(null)
  const [subRazonId, setSubRazonId] = React.useState<number | null>(null)
  const [articuloId, setArticuloId] = React.useState<string>('')
  const [clienteId, setClienteId] = React.useState<string>('')
  const [observaciones, setObservaciones] = React.useState('')

  const { data: razones = [] } = useGetRazonesActivasQuery()
  const { data: articulos = [] } = useGetArticulosQuery(PAGINACION_BASE)
  const { data: clientes = [] } = useGetClientesQuery(PAGINACION_BASE)
  const { mutateAsync: resolverNoCompra, isPending } = useResolverNoCompraMutation()
  const { toast } = useToast()

  const razonSeleccionada = razones.find((r: RazonNoCompra) => r.id === razonId)
  const subRazonesActivas = razonSeleccionada?.subRazones?.filter((s) => s.activo) ?? []

  const handleClose = () => {
    setRazonId(null)
    setSubRazonId(null)
    setArticuloId('')
    setClienteId('')
    setObservaciones('')
    onClose()
  }

  const handleConfirmar = async () => {
    if (!visitaId || !razonId) return
    try {
      await resolverNoCompra({
        id: visitaId,
        data: {
          razonId,
          subRazonId: subRazonId ?? undefined,
          articuloId: articuloId ? Number(articuloId) : undefined,
          clienteId: clienteId ? Number(clienteId) : undefined,
          observaciones: observaciones || undefined,
        },
      })
      toast({ title: '✓ No-compra registrada' })
      handleClose()
    } catch {
      toast({ title: 'Error al registrar', variant: 'destructive' })
    }
  }

  return (
    <Dialog open={visitaId !== null} onOpenChange={handleClose}>
      <DialogContent className="max-w-xl p-0 overflow-hidden rounded-3xl gap-0">

        <DialogTitle className="sr-only">Registrar motivo de no compra</DialogTitle>

        {/* Header */}
        <div className="bg-gradient-to-br from-red-500 to-red-700 px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-white/20 p-2.5">
              <XCircle className="h-6 w-6 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-white font-black text-2xl leading-none">No compró</h2>
              <p className="text-red-200 text-sm font-medium mt-0.5">¿Cuál fue el motivo?</p>
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
        <div className="px-8 py-6 space-y-5 bg-card">

          {/* Razón — botones grandes */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-base font-black">Razón principal</span>
              <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">Requerido</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {razones.map((r: RazonNoCompra) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => { setRazonId(r.id!); setSubRazonId(null) }}
                  className={cn(
                    'relative rounded-2xl border-2 py-4 px-4 text-left font-semibold text-sm',
                    'transition-all active:scale-95 touch-manipulation select-none cursor-pointer',
                    razonId === r.id
                      ? 'border-red-500 bg-red-50 text-red-800 shadow-sm'
                      : 'border-border bg-card hover:border-red-300'
                  )}
                >
                  {razonId === r.id && (
                    <Check className="inline h-3.5 w-3.5 text-red-500 mr-1 mb-0.5" strokeWidth={3} />
                  )}
                  {r.nombre}
                </button>
              ))}
            </div>
          </div>

          {/* Sub-razón */}
          {subRazonesActivas.length > 0 && (
            <div className="space-y-3">
              <span className="text-base font-black">Sub-razón</span>
              <div className="flex flex-wrap gap-2">
                {subRazonesActivas.map((s: SubRazonNoCompra) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSubRazonId(subRazonId === s.id ? null : s.id!)}
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-xl border-2 py-2.5 px-4 text-sm font-semibold',
                      'transition-all active:scale-95 touch-manipulation select-none cursor-pointer',
                      subRazonId === s.id
                        ? 'border-red-400 bg-red-50 text-red-700'
                        : 'border-border bg-card hover:border-red-200'
                    )}
                  >
                    {subRazonId === s.id && (
                      <Check className="h-3.5 w-3.5 text-red-500 shrink-0" strokeWidth={3} />
                    )}
                    {s.nombre}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Artículo y cliente en fila */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="font-semibold">Artículo <span className="text-muted-foreground font-normal">(opcional)</span></Label>
              <Combobox
                options={articulos.map((a: any) => ({ label: a.nombre, value: String(a.id) }))}
                value={articuloId}
                onChange={setArticuloId}
                placeholder="Buscar artículo..."
              />
            </div>
            <div className="space-y-1.5">
              <Label className="font-semibold">Cliente <span className="text-muted-foreground font-normal">(opcional)</span></Label>
              <Combobox
                options={clientes.map((c: any) => ({ label: c.nombre, value: String(c.id) }))}
                value={clienteId}
                onChange={setClienteId}
                placeholder="Buscar cliente..."
              />
            </div>
          </div>

          {/* Observaciones */}
          <div className="space-y-1.5">
            <Label className="font-semibold">Observaciones <span className="text-muted-foreground font-normal">(opcional)</span></Label>
            <Textarea
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              placeholder="Algún detalle adicional..."
              rows={2}
              className="resize-none text-base"
            />
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
            disabled={!razonId}
            onClick={handleConfirmar}
            className={cn(
              'flex-[2] py-4 rounded-2xl font-black text-xl h-auto',
              'bg-red-600 hover:bg-red-700 disabled:bg-muted',
              'shadow-lg shadow-red-200 transition-all',
              razonId && 'active:scale-[0.98]'
            )}
          >
            Guardar
          </LoadingButton>
        </div>
      </DialogContent>
    </Dialog>
  )
}
