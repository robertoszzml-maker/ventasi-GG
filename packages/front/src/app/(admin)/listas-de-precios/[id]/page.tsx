'use client'

import { PageTitle } from "@/components/ui/page-title"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { InputMoney } from "@/components/input-money"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useGetListaPrecioByIdQuery } from "@/hooks/lista-precio"
import { useGetArticulosPrecioByListaQuery, useUpdatePrecioLoteMutation, useAplicarPorcentajeMutation } from "@/hooks/articulo-precio"
import { useGetFamiliasQuery } from "@/hooks/familias"
import { useGetGruposByFamiliaIdQuery } from "@/hooks/grupos"
import { useGetSubgruposByGrupoIdQuery } from "@/hooks/subgrupos"
import { UpdatePrecioItem } from "@/types"
import { useToast } from "@/hooks/use-toast"
import { Search, SlidersHorizontal, X } from "lucide-react"
import React from "react"

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const listaPrecioId = Number(id);

  const { toast } = useToast();
  const { data: lista } = useGetListaPrecioByIdQuery(listaPrecioId);
  const { data: precios = [], isLoading } = useGetArticulosPrecioByListaQuery(listaPrecioId);

  const [cambios, setCambios] = React.useState<Record<number, number>>({});
  const [seleccionados, setSeleccionados] = React.useState<Set<number>>(new Set());
  const [busqueda, setBusqueda] = React.useState("");
  const [porcentajeInput, setPorcentajeInput] = React.useState("");

  // Filtros clasificación
  const [familiaId, setFamiliaId] = React.useState<number | undefined>();
  const [grupoId, setGrupoId] = React.useState<number | undefined>();
  const [subgrupoId, setSubgrupoId] = React.useState<number | undefined>();

  const { data: familias = [] } = useGetFamiliasQuery({ pagination: { pageIndex: 0, pageSize: 200 } });
  const { data: grupos = [] } = useGetGruposByFamiliaIdQuery(familiaId ?? 0);
  const { data: subgrupos = [] } = useGetSubgruposByGrupoIdQuery(grupoId ?? 0);

  const { mutateAsync: guardarLote, isPending: guardando } = useUpdatePrecioLoteMutation();
  const { mutateAsync: aplicarPct, isPending: aplicando } = useAplicarPorcentajeMutation();

  const preciosFiltrados = precios.filter((p) => {
    if (busqueda) {
      const q = busqueda.toLowerCase();
      const coincide =
        p.articulo?.nombre?.toLowerCase().includes(q) ||
        p.articulo?.codigo?.toLowerCase().includes(q) ||
        p.articulo?.sku?.toLowerCase().includes(q);
      if (!coincide) return false;
    }
    if (familiaId && p.articulo?.subgrupo?.grupo?.familia?.id !== familiaId) return false;
    if (grupoId && p.articulo?.subgrupo?.grupo?.id !== grupoId) return false;
    if (subgrupoId && p.articulo?.subgrupo?.id !== subgrupoId) return false;
    return true;
  });

  const hayFiltros = !!(busqueda || familiaId || grupoId || subgrupoId);
  const limpiarFiltros = () => {
    setBusqueda(""); setFamiliaId(undefined); setGrupoId(undefined); setSubgrupoId(undefined);
  };

  const haySeleccionados = seleccionados.size > 0;
  const hayCambios = Object.keys(cambios).length > 0;

  const toggleSeleccionado = (articuloId: number) => {
    setSeleccionados((prev) => {
      const next = new Set(prev);
      next.has(articuloId) ? next.delete(articuloId) : next.add(articuloId);
      return next;
    });
  };

  const toggleTodos = () => {
    if (seleccionados.size === preciosFiltrados.length) {
      setSeleccionados(new Set());
    } else {
      setSeleccionados(new Set(preciosFiltrados.map((p) => p.articuloId)));
    }
  };

  const guardarCambios = async () => {
    const items: UpdatePrecioItem[] = Object.entries(cambios).map(([articuloId, precio]) => ({
      articuloId: Number(articuloId),
      listaPrecioId,
      precio,
    }));
    try {
      await guardarLote(items);
      setCambios({});
      toast({ title: `${items.length} precio${items.length !== 1 ? 's' : ''} actualizado${items.length !== 1 ? 's' : ''}` });
    } catch {
      toast({ title: "Error al guardar precios", variant: "destructive" });
    }
  };

  const aplicarPorcentaje = async () => {
    if (!haySeleccionados) return;
    const pct = parseFloat(porcentajeInput);
    if (isNaN(pct)) { toast({ title: "Ingresá un porcentaje válido", variant: "destructive" }); return; }
    try {
      const { afectados } = await aplicarPct({ listaPrecioId, articuloIds: Array.from(seleccionados), porcentaje: pct });
      setSeleccionados(new Set());
      setPorcentajeInput("");
      toast({ title: `Porcentaje aplicado a ${afectados} artículo${afectados !== 1 ? 's' : ''}` });
    } catch {
      toast({ title: "Error al aplicar porcentaje", variant: "destructive" });
    }
  };

  return (
    <>
      <PageTitle title={lista?.nombre ?? "Lista de precios"}>
        {lista?.esDefault === 1 && <Badge variant="secondary">Predeterminada</Badge>}
        {lista?.descripcion && (
          <span className="text-sm text-muted-foreground font-normal">{lista.descripcion}</span>
        )}
      </PageTitle>

      <div className="space-y-4">
        {/* Filtros */}
        <div className="rounded-lg border bg-muted/30 p-3 space-y-3">
          {/* Búsqueda + limpiar */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, código o SKU..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="pl-8"
              />
            </div>
            {hayFiltros && (
              <Button variant="ghost" size="sm" onClick={limpiarFiltros} className="gap-1.5 text-muted-foreground">
                <X className="h-3.5 w-3.5" />
                Limpiar
              </Button>
            )}
          </div>

          {/* Selectores clasificación */}
          <div className="flex items-center gap-2 flex-wrap">
            <SlidersHorizontal className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <Select
              value={familiaId ? String(familiaId) : "todos"}
              onValueChange={(v) => {
                setFamiliaId(v === "todos" ? undefined : Number(v));
                setGrupoId(undefined);
                setSubgrupoId(undefined);
              }}
            >
              <SelectTrigger className="w-40 h-8 text-sm">
                <SelectValue placeholder="Familia" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todas las familias</SelectItem>
                {familias.map((f) => (
                  <SelectItem key={f.id} value={String(f.id)}>{f.nombre}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={grupoId ? String(grupoId) : "todos"}
              onValueChange={(v) => {
                setGrupoId(v === "todos" ? undefined : Number(v));
                setSubgrupoId(undefined);
              }}
              disabled={!familiaId}
            >
              <SelectTrigger className="w-40 h-8 text-sm">
                <SelectValue placeholder={familiaId ? "Grupo" : "Primero familia"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los grupos</SelectItem>
                {grupos.map((g) => (
                  <SelectItem key={g.id} value={String(g.id)}>{g.nombre}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={subgrupoId ? String(subgrupoId) : "todos"}
              onValueChange={(v) => setSubgrupoId(v === "todos" ? undefined : Number(v))}
              disabled={!grupoId}
            >
              <SelectTrigger className="w-44 h-8 text-sm">
                <SelectValue placeholder={grupoId ? "Subgrupo" : "Primero grupo"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los subgrupos</SelectItem>
                {subgrupos.map((s) => (
                  <SelectItem key={s.id} value={String(s.id)}>{s.nombre}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <span className="text-xs text-muted-foreground ml-auto">
              {preciosFiltrados.length} artículo{preciosFiltrados.length !== 1 ? 's' : ''}
              {hayFiltros && ` de ${precios.length}`}
            </span>
          </div>
        </div>

        {/* Barra de acciones */}
        <div className="flex items-center gap-3 flex-wrap min-h-9">
          {haySeleccionados && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">{seleccionados.size} seleccionado{seleccionados.size !== 1 ? 's' : ''}</span>
              <Input
                type="number"
                step="0.01"
                placeholder="% (ej: 15 o -10)"
                value={porcentajeInput}
                onChange={(e) => setPorcentajeInput(e.target.value)}
                className="w-36 h-8 text-sm"
              />
              <Button size="sm" variant="outline" onClick={aplicarPorcentaje} disabled={aplicando}>
                {aplicando ? 'Aplicando...' : 'Aplicar %'}
              </Button>
            </div>
          )}

          {hayCambios && (
            <Button size="sm" onClick={guardarCambios} disabled={guardando} className="ml-auto">
              {guardando ? 'Guardando...' : `Guardar cambios (${Object.keys(cambios).length})`}
            </Button>
          )}
        </div>

        {/* Tabla */}
        <div className="rounded-lg border overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center text-sm text-muted-foreground">Cargando...</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/40 border-b">
                  <th className="p-3 text-left w-10">
                    <Checkbox
                      checked={preciosFiltrados.length > 0 && seleccionados.size === preciosFiltrados.length}
                      onCheckedChange={toggleTodos}
                    />
                  </th>
                  <th className="p-3 text-left font-medium text-muted-foreground">Artículo</th>
                  <th className="p-3 text-left font-medium text-muted-foreground w-28">Código</th>
                  <th className="p-3 text-left font-medium text-muted-foreground w-36">Clasificación</th>
                  <th className="p-3 text-right font-medium text-muted-foreground w-44">Precio</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {preciosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-10 text-center text-muted-foreground">
                      {hayFiltros ? 'Ningún artículo coincide con los filtros.' : 'No hay artículos en esta lista.'}
                    </td>
                  </tr>
                ) : preciosFiltrados.map((p) => {
                  const valorActual = cambios[p.articuloId] ?? p.precio;
                  const tieneCambio = cambios[p.articuloId] !== undefined;
                  const estaSeleccionado = seleccionados.has(p.articuloId);
                  return (
                    <tr
                      key={p.id}
                      className={`transition-colors ${
                        estaSeleccionado ? 'bg-primary/5' : tieneCambio ? 'bg-amber-50/40 dark:bg-amber-950/10' : 'hover:bg-muted/30'
                      }`}
                    >
                      <td className="p-3">
                        <Checkbox
                          checked={estaSeleccionado}
                          onCheckedChange={() => toggleSeleccionado(p.articuloId)}
                        />
                      </td>
                      <td className="p-3">
                        <div className="font-medium leading-tight">{p.articulo?.nombre}</div>
                        {p.articulo?.sku && (
                          <div className="text-xs text-muted-foreground font-mono mt-0.5">{p.articulo.sku}</div>
                        )}
                      </td>
                      <td className="p-3 font-mono text-muted-foreground text-xs">{p.articulo?.codigo}</td>
                      <td className="p-3">
                        <div className="text-xs text-muted-foreground leading-tight space-y-0.5">
                          {p.articulo?.subgrupo?.grupo?.familia?.nombre && (
                            <div>{p.articulo.subgrupo.grupo.familia.nombre}</div>
                          )}
                          {p.articulo?.subgrupo?.nombre && (
                            <div className="opacity-70">{p.articulo.subgrupo.nombre}</div>
                          )}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center justify-end gap-2">
                          {tieneCambio && (
                            <span className="text-xs text-amber-600 dark:text-amber-400 shrink-0">modificado</span>
                          )}
                          <InputMoney
                            value={valorActual}
                            onChange={(valor) => {
                              if (valor >= 0) setCambios((prev) => ({ ...prev, [p.articuloId]: valor }));
                            }}
                            className="w-36"
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}
