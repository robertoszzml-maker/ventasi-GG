'use client';

import React from 'react';
import { Articulo, CeldaGrilla, EstadoSemaforo } from '@/types';
import {
  useGetGrillaQuery,
  useActualizarUmbralVarianteMutation,
  useBulkUmbralesMutation,
} from '@/hooks/articulo-variantes';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogTrigger, DialogFooter, DialogClose,
} from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Copy, Layers, Save } from 'lucide-react';
import { LoadingButton } from '@/components/ui/loading-button';
import { cn } from '@/lib/utils';

interface GrillaUmbralesProps {
  articulo: Articulo;
}

type UmbralFila = { minimo: string; seguridad: string; maximo: string };

const ESTADO_CONFIG: Record<EstadoSemaforo, { label: string; dot: string }> = {
  ROJO:       { label: 'Crítico',   dot: 'bg-red-500' },
  AMARILLO:   { label: 'Atención',  dot: 'bg-yellow-400' },
  VERDE:      { label: 'Normal',    dot: 'bg-green-500' },
  SIN_ESTADO: { label: 'Sin datos', dot: 'bg-muted-foreground/30' },
};

function toStr(v: number | null | undefined) {
  return v != null ? String(v) : '';
}
function toNum(s: string): number | null {
  if (s.trim() === '') return null;
  const n = parseInt(s, 10);
  return isNaN(n) || n < 0 ? null : n;
}
function celdaToFila(c: CeldaGrilla): UmbralFila {
  return { minimo: toStr(c.stockMinimo), seguridad: toStr(c.stockSeguridad), maximo: toStr(c.stockMaximo) };
}

function SemaforoDot({ estado }: { estado?: EstadoSemaforo }) {
  const cfg = ESTADO_CONFIG[estado ?? 'SIN_ESTADO'];
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className={`w-3 h-3 rounded-full ${cfg.dot} mx-auto cursor-default`} />
      </TooltipTrigger>
      <TooltipContent>{cfg.label}</TooltipContent>
    </Tooltip>
  );
}

function DialogBulkUmbrales({
  articuloId,
  onSuccess,
}: {
  articuloId: number;
  onSuccess: (minimo: string, seguridad: string, maximo: string) => void;
}) {
  const [minimo, setMinimo] = React.useState('');
  const [seguridad, setSeguridad] = React.useState('');
  const [maximo, setMaximo] = React.useState('');
  const { mutateAsync, isPending } = useBulkUmbralesMutation();
  const { toast } = useToast();

  const handleSubmit = async () => {
    await mutateAsync({
      articuloId,
      stockMinimo: minimo !== '' ? parseInt(minimo) : undefined,
      stockSeguridad: seguridad !== '' ? parseInt(seguridad) : undefined,
      stockMaximo: maximo !== '' ? parseInt(maximo) : undefined,
    });
    toast({ title: 'Umbrales aplicados a todas las variantes' });
    onSuccess(minimo, seguridad, maximo);
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Aplicar umbrales a todas las variantes</DialogTitle>
      </DialogHeader>
      <p className="text-sm text-muted-foreground -mt-2">
        Reemplaza los umbrales de todas las variantes. Dejá vacío para no modificar ese campo.
      </p>
      <div className="grid grid-cols-3 gap-3 py-2">
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-red-600">Mínimo</p>
          <Input type="number" min={0} value={minimo} onChange={(e) => setMinimo(e.target.value)} placeholder="—" />
        </div>
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-yellow-600">Seguridad</p>
          <Input type="number" min={0} value={seguridad} onChange={(e) => setSeguridad(e.target.value)} placeholder="—" />
        </div>
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-green-600">Máximo</p>
          <Input type="number" min={0} value={maximo} onChange={(e) => setMaximo(e.target.value)} placeholder="—" />
        </div>
      </div>
      <DialogFooter>
        <DialogClose asChild>
          <Button variant="outline">Cancelar</Button>
        </DialogClose>
        <LoadingButton loading={isPending} onClick={handleSubmit}>
          Guardar para todas
        </LoadingButton>
      </DialogFooter>
    </DialogContent>
  );
}

export function GrillaUmbrales({ articulo }: GrillaUmbralesProps) {
  const { data: grilla } = useGetGrillaQuery(articulo.id!);
  const { mutateAsync: guardarUmbral } = useActualizarUmbralVarianteMutation();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [guardando, setGuardando] = React.useState(false);

  // valores: lo que el usuario ve/edita en pantalla
  // baseline: último estado confirmado (guardado en servidor)
  const [valores, setValores] = React.useState<Record<number, UmbralFila>>({});
  const [baseline, setBaseline] = React.useState<Record<number, UmbralFila>>({});

  const celdas = (grilla?.celdas ?? []).filter((c) => c.estado === 'real' && c.varianteId);
  const talles = grilla?.talles ?? [];
  const colores = grilla?.colores ?? [];

  // Inicializa desde el servidor (solo la primera vez que llegan datos)
  React.useEffect(() => {
    if (!grilla || celdas.length === 0 || Object.keys(valores).length > 0) return;
    const init = Object.fromEntries(celdas.map((c) => [c.varianteId!, celdaToFila(c)]));
    setValores(init);
    setBaseline(init);
  }, [grilla]);

  const isDirty = (varId: number) => {
    const v = valores[varId];
    const b = baseline[varId];
    if (!v || !b) return false;
    return v.minimo !== b.minimo || v.seguridad !== b.seguridad || v.maximo !== b.maximo;
  };

  const hayDirty = celdas.some((c) => c.varianteId && isDirty(c.varianteId));

  const setFila = (varId: number, campo: keyof UmbralFila, val: string) => {
    setValores((prev) => ({ ...prev, [varId]: { ...prev[varId], [campo]: val } }));
  };

  // Copia los valores de una fila a todas las demás (solo local, sin guardar)
  const handleCopiar = (celda: CeldaGrilla) => {
    const fila = valores[celda.varianteId!];
    if (!fila) return;
    setValores((prev) => {
      const next = { ...prev };
      for (const c of celdas) {
        if (c.varianteId !== celda.varianteId) {
          next[c.varianteId!] = { ...fila };
        }
      }
      return next;
    });
  };

  // Guarda todas las filas con cambios pendientes
  const handleGuardarTodos = async () => {
    const sucias = celdas.filter((c) => c.varianteId && isDirty(c.varianteId));
    if (sucias.length === 0) return;
    setGuardando(true);
    try {
      await Promise.all(
        sucias.map((c) =>
          guardarUmbral({
            articuloId: articulo.id!,
            varianteId: c.varianteId!,
            dto: {
              stockMinimo: toNum(valores[c.varianteId!].minimo),
              stockSeguridad: toNum(valores[c.varianteId!].seguridad),
              stockMaximo: toNum(valores[c.varianteId!].maximo),
            },
          })
        )
      );
      // Actualiza el baseline para que las filas ya no queden como dirty
      setBaseline((prev) => ({ ...prev, ...Object.fromEntries(sucias.map((c) => [c.varianteId!, valores[c.varianteId!]])) }));
      toast({ title: `${sucias.length === 1 ? 'Umbral guardado' : `${sucias.length} umbrales guardados`}` });
    } finally {
      setGuardando(false);
    }
  };

  // Aplica bulk: guarda en servidor y sincroniza el estado local
  const handleBulkSuccess = (minimo: string, seguridad: string, maximo: string) => {
    const nuevaFila: UmbralFila = { minimo, seguridad, maximo };
    const next = Object.fromEntries(celdas.map((c) => [c.varianteId!, { ...nuevaFila }]));
    setValores(next);
    setBaseline(next);
    setDialogOpen(false);
  };

  if (celdas.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No hay variantes activas. Primero registrá un ingreso para generar variantes.
      </p>
    );
  }

  // Calcula semáforo local (en base a los valores en pantalla, no a los del servidor)
  const calcularEstado = (varId: number, stockActual: number): EstadoSemaforo => {
    const fila = valores[varId];
    if (!fila) return 'SIN_ESTADO';
    const min = toNum(fila.minimo);
    const seg = toNum(fila.seguridad);
    if (min === null) return 'SIN_ESTADO';
    if (stockActual <= min) return 'ROJO';
    if (seg !== null && stockActual <= seg) return 'AMARILLO';
    return 'VERDE';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Layers className="h-3.5 w-3.5" />
              Aplicar a todas las variantes
            </Button>
          </DialogTrigger>
          <DialogBulkUmbrales articuloId={articulo.id!} onSuccess={handleBulkSuccess} />
        </Dialog>

        <LoadingButton
          size="sm"
          className="gap-2"
          loading={guardando}
          disabled={!hayDirty}
          onClick={handleGuardarTodos}
        >
          <Save className="h-3.5 w-3.5" />
          {hayDirty ? 'Guardar cambios' : 'Sin cambios'}
        </LoadingButton>
      </div>

      <div className="overflow-x-auto rounded-md border">
        <table className="text-sm w-full border-collapse">
          <thead>
            <tr className="bg-muted/50">
              <th className="border-b px-3 py-2 text-left font-medium text-xs">Talle</th>
              <th className="border-b px-3 py-2 text-left font-medium text-xs">Color</th>
              <th className="border-b px-3 py-2 text-center font-medium text-xs">Stock</th>
              <th className="border-b px-3 py-2 text-center font-medium text-xs text-red-600">Mínimo</th>
              <th className="border-b px-3 py-2 text-center font-medium text-xs text-yellow-600">Seguridad</th>
              <th className="border-b px-3 py-2 text-center font-medium text-xs text-green-600">Máximo</th>
              <th className="border-b px-3 py-2 text-center font-medium text-xs">Estado</th>
              <th className="border-b px-3 py-2 w-8" />
            </tr>
          </thead>
          <tbody>
            {talles.map((talle) =>
              colores.map((color) => {
                const celda = celdas.find((c) => c.talleId === talle.id && c.colorId === color.id);
                if (!celda || !celda.varianteId) return null;
                const varId = celda.varianteId;
                const fila = valores[varId] ?? { minimo: '', seguridad: '', maximo: '' };
                const stock = parseInt(celda.cantidad ?? '0') || 0;
                const dirty = isDirty(varId);
                const estadoLocal = calcularEstado(varId, stock);

                return (
                  <tr key={varId} className={cn('transition-colors', dirty ? 'bg-amber-50/50' : 'hover:bg-muted/20')}>
                    <td className="border-b px-3 py-1.5 font-mono font-semibold text-xs">{talle.codigo}</td>
                    <td className="border-b px-3 py-1.5 text-xs">{color.nombre}</td>
                    <td className="border-b px-3 py-1.5 text-center tabular-nums text-xs font-semibold">{stock}</td>
                    <td className="border-b px-1 py-1.5 text-center">
                      <Input
                        type="number" min={0}
                        value={fila.minimo}
                        onChange={(e) => setFila(varId, 'minimo', e.target.value)}
                        className="h-7 w-16 text-xs text-center px-1"
                        placeholder="—"
                      />
                    </td>
                    <td className="border-b px-1 py-1.5 text-center">
                      <Input
                        type="number" min={0}
                        value={fila.seguridad}
                        onChange={(e) => setFila(varId, 'seguridad', e.target.value)}
                        className="h-7 w-16 text-xs text-center px-1"
                        placeholder="—"
                      />
                    </td>
                    <td className="border-b px-1 py-1.5 text-center">
                      <Input
                        type="number" min={0}
                        value={fila.maximo}
                        onChange={(e) => setFila(varId, 'maximo', e.target.value)}
                        className="h-7 w-16 text-xs text-center px-1"
                        placeholder="—"
                      />
                    </td>
                    <td className="border-b px-3 py-1.5 text-center">
                      <SemaforoDot estado={estadoLocal} />
                    </td>
                    <td className="border-b px-2 py-1.5 text-center">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => handleCopiar(celda)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Copiar estos umbrales a todas las demás variantes</TooltipContent>
                      </Tooltip>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
