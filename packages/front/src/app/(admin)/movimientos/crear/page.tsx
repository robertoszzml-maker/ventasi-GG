'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { PageTitle } from '@/components/ui/page-title'
import { Button } from '@/components/ui/button'
import { LoadingButton } from '@/components/ui/loading-button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Combobox } from '@/components/ui/combobox'
import { useToast } from '@/hooks/use-toast'
import { useGetUbicacionesQuery } from '@/hooks/ubicacion'
import { useGetProveedoresQuery } from '@/hooks/proveedor'
import { useGetClientesQuery } from '@/hooks/cliente'
import { useGetArticulosQuery } from '@/hooks/articulos'
import { useCreateMovimientoInventarioMutation } from '@/hooks/movimiento-inventario'
import { ArticuloMovimientoDialog } from '@/components/inventario/articulo-movimiento-dialog'
import { ArticuloMovimientoRow } from '@/components/inventario/articulo-movimiento-row'
import { DetalleMovimiento, Articulo, TipoMovimiento } from '@/types'
import { Plus, Printer } from 'lucide-react'

const PAGINACION_BASE = { pagination: { pageIndex: 0, pageSize: 500 } }

const TIPOS: { value: TipoMovimiento; label: string }[] = [
  { value: 'MOVIMIENTO', label: 'Movimiento' },
  { value: 'ARREGLO', label: 'Arreglo / Ajuste' },
]

type TipoOrigen = 'ubicacion' | 'proveedor' | 'cliente'

export default function NuevoMovimientoPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [tipo, setTipo] = React.useState<TipoMovimiento>('MOVIMIENTO')
  const [descripcion, setDescripcion] = React.useState('')

  const [tipoProcedencia, setTipoProcedencia] = React.useState<TipoOrigen>('proveedor')
  const [procedenciaId, setProcedenciaId] = React.useState<string>('')
  const [tipoDestino, setTipoDestino] = React.useState<TipoOrigen>('ubicacion')
  const [destinoId, setDestinoId] = React.useState<string>('')

  const [articulosSeleccionados, setArticulosSeleccionados] = React.useState<Articulo[]>([])
  const [detallesPorArticulo, setDetallesPorArticulo] = React.useState<Record<number, DetalleMovimiento[]>>({})

  const [dialogAbierto, setDialogAbierto] = React.useState(false)
  const [articuloEditando, setArticuloEditando] = React.useState<Articulo | undefined>()

  const { data: ubicaciones = [] } = useGetUbicacionesQuery(PAGINACION_BASE)
  const { data: proveedores = [] } = useGetProveedoresQuery(PAGINACION_BASE)
  const { data: clientes = [] } = useGetClientesQuery(PAGINACION_BASE)
  const { data: articulos = [] } = useGetArticulosQuery(PAGINACION_BASE)

  const { mutateAsync: crearMovimiento, isPending } = useCreateMovimientoInventarioMutation()

  const modoArreglo = tipo === 'ARREGLO'

  // Defaults al cambiar tipo
  React.useEffect(() => {
    setProcedenciaId('')
    setDestinoId('')
    if (tipo === 'MOVIMIENTO') { setTipoProcedencia('proveedor'); setTipoDestino('ubicacion') }
    if (tipo === 'ARREGLO') { setProcedenciaId(''); setDestinoId('') }
  }, [tipo])

  const cantidadTotal = Object.values(detallesPorArticulo)
    .flat()
    .reduce((sum, d) => sum + (parseInt(d.cantidad) || 0), 0)

  const abrirDialogNuevo = () => { setArticuloEditando(undefined); setDialogAbierto(true) }
  const abrirDialogEditar = (articulo: Articulo) => { setArticuloEditando(articulo); setDialogAbierto(true) }

  const confirmarArticulo = (articulo: Articulo, detalles: DetalleMovimiento[]) => {
    const id = articulo.id!
    if (!articulosSeleccionados.some((a) => a.id === id)) {
      setArticulosSeleccionados((prev) => [...prev, articulo])
    }
    setDetallesPorArticulo((prev) => ({ ...prev, [id]: detalles }))
  }

  const quitarArticulo = (articuloId: number) => {
    setArticulosSeleccionados((prev) => prev.filter((a) => a.id !== articuloId))
    setDetallesPorArticulo((prev) => {
      const next = { ...prev }
      delete next[articuloId]
      return next
    })
  }

  const actualizarDetalles = (articuloId: number, detalles: DetalleMovimiento[]) => {
    setDetallesPorArticulo((prev) => ({ ...prev, [articuloId]: detalles }))
  }

  const buildPayload = () => {
    if (modoArreglo) return { procedenciaUbicacionId: parseInt(procedenciaId) }
    return {
      procedenciaUbicacionId: tipoProcedencia === 'ubicacion' ? parseInt(procedenciaId) : undefined,
      procedenciaProveedorId: tipoProcedencia === 'proveedor' ? parseInt(procedenciaId) : undefined,
      procedenciaClienteId:   tipoProcedencia === 'cliente'   ? parseInt(procedenciaId) : undefined,
      destinoUbicacionId: tipoDestino === 'ubicacion' ? parseInt(destinoId) : undefined,
      destinoProveedorId: tipoDestino === 'proveedor' ? parseInt(destinoId) : undefined,
      destinoClienteId:   tipoDestino === 'cliente'   ? parseInt(destinoId) : undefined,
    }
  }

  const validar = () => {
    if (modoArreglo && !procedenciaId) {
      toast({ title: 'Debe seleccionar la ubicación a ajustar', variant: 'destructive' })
      return null
    }
    if (!modoArreglo && (!procedenciaId || !destinoId)) {
      toast({ title: 'Debe seleccionar procedencia y destino', variant: 'destructive' })
      return null
    }
    const todosDetalles = Object.values(detallesPorArticulo)
      .flat()
      .filter((d) => parseInt(d.cantidad) > 0)
    if (todosDetalles.length === 0) {
      toast({ title: 'Debe ingresar al menos una cantidad', variant: 'destructive' })
      return null
    }
    return todosDetalles
  }

  const handleSubmit = async () => {
    const todosDetalles = validar()
    if (!todosDetalles) return
    try {
      const movimiento = await crearMovimiento({
        tipo,
        fecha: new Date().toISOString(),
        descripcion: descripcion || undefined,
        ...buildPayload(),
        detalles: todosDetalles,
      } as any)
      toast({ title: 'Movimiento registrado correctamente' })
      router.push(`/movimientos/${movimiento.id}`)
    } catch (e: any) {
      toast({ title: e?.message || 'Error al registrar movimiento', variant: 'destructive' })
    }
  }

  const handleSubmitEImprimir = async () => {
    const todosDetalles = validar()
    if (!todosDetalles) return
    try {
      const movimiento = await crearMovimiento({
        tipo,
        fecha: new Date().toISOString(),
        descripcion: descripcion || undefined,
        ...buildPayload(),
        detalles: todosDetalles,
      } as any)
      toast({ title: 'Movimiento registrado correctamente' })
      router.push(`/etiquetas/preparar?movimientoId=${movimiento.id}`)
    } catch (e: any) {
      toast({ title: e?.message || 'Error al registrar movimiento', variant: 'destructive' })
    }
  }

  const toOptions = (items: any[]) =>
    items.map((o) => ({ value: String(o.id), label: o.nombre }))

  const opcionesProcedencia = toOptions(
    tipoProcedencia === 'ubicacion' ? ubicaciones :
    tipoProcedencia === 'proveedor' ? proveedores : clientes
  )

  const opcionesDestino = toOptions(
    tipoDestino === 'ubicacion' ? ubicaciones :
    tipoDestino === 'proveedor' ? proveedores : clientes
  )

  const articulosDisponibles = articulos.filter(
    (a) => !articulosSeleccionados.some((s) => s.id === a.id)
  )

  return (
    <>
      <PageTitle title="Nuevo Movimiento de Inventario" />

      <div className="space-y-8">

        {/* Cabecera */}
        <section className="space-y-4">
          {/* Tipo + Procedencia + Destino en una fila */}
          <div className="flex gap-6 items-start">
            {/* Tipo: radio buttons */}
            <div className="space-y-1 shrink-0">
              <Label className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Tipo</Label>
              <div className="flex flex-col gap-1 pt-0.5">
                {TIPOS.map((t) => (
                  <label key={t.value} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="tipo"
                      value={t.value}
                      checked={tipo === t.value}
                      onChange={() => setTipo(t.value)}
                      className="accent-primary"
                    />
                    <span className="text-sm">{t.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Procedencia */}
            <div className="space-y-2 flex-1">
              <Label className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                {modoArreglo ? 'Ubicación a ajustar' : 'Procedencia'}
              </Label>
              <div className="flex gap-1.5">
                {(['proveedor', 'ubicacion', 'cliente'] as TipoOrigen[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    disabled={modoArreglo}
                    onClick={() => { setTipoProcedencia(t); setProcedenciaId('') }}
                    className={`text-xs px-2 py-1 rounded border transition-colors ${modoArreglo ? 'opacity-40 cursor-default' : ''} ${tipoProcedencia === t && !modoArreglo ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground'}`}
                  >
                    {t === 'ubicacion' ? 'Ubicación' : t === 'proveedor' ? 'Proveedor' : 'Cliente'}
                  </button>
                ))}
              </div>
              <Combobox
                options={modoArreglo ? toOptions(ubicaciones) : opcionesProcedencia}
                value={procedenciaId}
                onChange={setProcedenciaId}
                placeholder="Seleccionar ubicación..."
                searchPlaceholder="Buscar ubicación..."
              />
            </div>

            {/* Destino */}
            <div className={`space-y-2 flex-1 ${modoArreglo ? 'opacity-40 pointer-events-none select-none' : ''}`}>
              <Label className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Destino</Label>
              <div className="flex gap-1.5">
                {(['ubicacion', 'cliente', 'proveedor'] as TipoOrigen[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    disabled={modoArreglo}
                    onClick={() => { setTipoDestino(t); setDestinoId('') }}
                    className={`text-xs px-2 py-1 rounded border transition-colors ${tipoDestino === t ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground'}`}
                  >
                    {t === 'ubicacion' ? 'Ubicación' : t === 'proveedor' ? 'Proveedor' : 'Cliente'}
                  </button>
                ))}
              </div>
              <Combobox
                options={opcionesDestino}
                value={destinoId}
                onChange={setDestinoId}
                placeholder={`Seleccionar ${tipoDestino}...`}
                searchPlaceholder={`Buscar ${tipoDestino}...`}
                disabled={modoArreglo}
              />
            </div>
          </div>

          <div>
            <Label>Descripción (opcional)</Label>
            <Textarea
              className="mt-1"
              placeholder="Ej: Egreso por devolución por falla..."
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
            />
          </div>
        </section>

        {/* Artículos */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm">Artículos</h3>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={abrirDialogNuevo}
              disabled={articulosDisponibles.length === 0 && articulosSeleccionados.length === 0}
            >
              <Plus className="h-4 w-4 mr-1" />
              Agregar artículo
            </Button>
          </div>

          {articulosSeleccionados.length === 0 ? (
            <div className="border border-dashed border-border rounded-lg py-10 text-center text-sm text-muted-foreground">
              Todavía no hay artículos en este movimiento.
            </div>
          ) : (
            <div className="space-y-2">
              {articulosSeleccionados.map((articulo) => (
                <ArticuloMovimientoRow
                  key={articulo.id}
                  articulo={articulo}
                  detalles={detallesPorArticulo[articulo.id!] || []}
                  onEditar={abrirDialogEditar}
                  onRemove={quitarArticulo}
                  onDetallesChange={actualizarDetalles}
                  modoArreglo={modoArreglo}
                  ubicacionId={
                    tipo === 'INGRESO' ? (destinoId ? parseInt(destinoId) : undefined) :
                    (procedenciaId && tipoProcedencia === 'ubicacion') ? parseInt(procedenciaId) : undefined
                  }
                />
              ))}
            </div>
          )}

          {articulosSeleccionados.length > 0 && (
            <p className="text-xs text-muted-foreground text-right">
              Total: <span className="font-semibold tabular-nums">{cantidadTotal}</span> unidades
            </p>
          )}
        </section>

        {/* Footer */}
        <div className="flex justify-between items-center pt-2 border-t">
          <Button variant="outline" onClick={() => router.push('/movimientos')}>
            Cancelar
          </Button>
          <div className="flex gap-2">
            {cantidadTotal > 0 && (
              <LoadingButton
                loading={isPending}
                variant="outline"
                onClick={handleSubmitEImprimir}
              >
                <Printer className="h-4 w-4 mr-2" />
                Registrar e imprimir etiquetas
              </LoadingButton>
            )}
            <LoadingButton loading={isPending} onClick={handleSubmit}>
              Registrar movimiento
            </LoadingButton>
          </div>
        </div>

      </div>

      <ArticuloMovimientoDialog
        open={dialogAbierto}
        onOpenChange={setDialogAbierto}
        articulosDisponibles={articulosDisponibles}
        articuloFijo={articuloEditando}
        detallesIniciales={articuloEditando ? detallesPorArticulo[articuloEditando.id!] ?? [] : []}
        modoArreglo={modoArreglo}
        onConfirmar={confirmarArticulo}
      />
    </>
  )
}
