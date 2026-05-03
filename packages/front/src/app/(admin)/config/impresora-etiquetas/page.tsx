'use client';

import React from 'react';
import { PageTitle } from '@/components/ui/page-title';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Printer, Usb, Monitor, CheckCircle2, AlertCircle, Loader2, X } from 'lucide-react';
import { useEtiquetaConfig } from '@/hooks/etiqueta-config';
import { useWebSerial, WEB_SERIAL_ERROR_LABELS } from '@/hooks/use-web-serial';
import { EtiquetaPreview } from '@/components/etiqueta/etiqueta-preview';
import { CampoEtiqueta, EtiquetaConfig } from '@/lib/etiqueta';
import { VarianteEtiqueta } from '@/types';

const VARIANTE_EJEMPLO: VarianteEtiqueta = {
  articuloId: 1,
  articuloNombre: 'Remera Básica Algodón',
  varianteId: 1,
  talleNombre: 'M',
  colorNombre: 'Negro',
  codigoBarras: null,
};

const CAMPOS: { id: CampoEtiqueta; label: string }[] = [
  { id: 'titulo', label: 'Título del artículo' },
  { id: 'talle', label: 'Talle' },
  { id: 'color', label: 'Color' },
  { id: 'codigoBarras', label: 'Código de barras' },
];

export default function ImpresoraEtiquetasPage() {
  const { config, setConfig } = useEtiquetaConfig();
  const { isAvailable, isConnected, isConnecting, error, info, connect, clearError, testConnection, disconnect } = useWebSerial();
  const [guardado, setGuardado] = React.useState(false);
  const [probando, setProbando] = React.useState(false);
  const [resultadoPrueba, setResultadoPrueba] = React.useState<'ok' | 'error' | null>(null);

  const actualizar = (cambios: Partial<EtiquetaConfig>) => {
    setConfig({ ...config, ...cambios });
    setGuardado(false);
  };

  const toggleCampo = (campo: CampoEtiqueta) => {
    const campos = config.campos.includes(campo)
      ? config.campos.filter((c) => c !== campo)
      : [...config.campos, campo];
    actualizar({ campos });
  };

  const guardar = () => {
    setConfig(config);
    setGuardado(true);
    setTimeout(() => setGuardado(false), 2000);
  };

  const handleProbarConexion = async () => {
    if (!isConnected) {
      const ok = await connect();
      if (!ok) return;
    }
    setProbando(true);
    setResultadoPrueba(null);
    const ok = await testConnection();
    setResultadoPrueba(ok ? 'ok' : 'error');
    setProbando(false);
  };

  const nombreDispositivo = info
    ? info.esZebra
      ? `Zebra (VendorID: ${info.usbVendorId?.toString(16)})`
      : `Dispositivo USB (VendorID: ${info.usbVendorId?.toString(16) ?? 'desconocido'})`
    : null;

  return (
    <div className="space-y-6">
      <PageTitle title="Impresora de etiquetas" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Columna izquierda: configuración */}
        <div className="space-y-6">

          {/* Dimensiones */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Dimensiones de etiqueta
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="ancho">Ancho (mm)</Label>
                <Input
                  id="ancho"
                  type="number"
                  min={20}
                  max={200}
                  value={config.ancho_mm}
                  onChange={(e) => actualizar({ ancho_mm: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="alto">Alto (mm)</Label>
                <Input
                  id="alto"
                  type="number"
                  min={10}
                  max={200}
                  value={config.alto_mm}
                  onChange={(e) => actualizar({ alto_mm: Number(e.target.value) })}
                />
              </div>
            </div>
          </div>

          {/* Campos visibles */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Campos en la etiqueta
            </h3>
            {CAMPOS.map((campo) => (
              <div key={campo.id} className="flex items-center justify-between">
                <Label htmlFor={`campo-${campo.id}`} className="cursor-pointer">
                  {campo.label}
                </Label>
                <Switch
                  id={`campo-${campo.id}`}
                  checked={config.campos.includes(campo.id)}
                  onCheckedChange={() => toggleCampo(campo.id)}
                />
              </div>
            ))}
          </div>

          {/* Modo de impresión */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Modo de impresión
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => actualizar({ modo: 'sistema' })}
                className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-colors ${
                  config.modo === 'sistema'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <Monitor className="h-6 w-6" />
                <span className="text-sm font-medium">Sistema</span>
                <span className="text-xs text-muted-foreground text-center">
                  Diálogo del OS
                </span>
              </button>

              <button
                type="button"
                onClick={() => isAvailable && actualizar({ modo: 'web-serial' })}
                disabled={!isAvailable}
                className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-colors ${
                  !isAvailable
                    ? 'border-border opacity-40 cursor-not-allowed'
                    : config.modo === 'web-serial'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <Usb className="h-6 w-6" />
                <span className="text-sm font-medium">Web Serial</span>
                <span className="text-xs text-muted-foreground text-center">
                  {isAvailable ? 'Sin diálogo (USB directo)' : 'Requiere Chrome 89+'}
                </span>
              </button>
            </div>

            {/* Estado de conexión Web Serial */}
            {config.modo === 'web-serial' && isAvailable && (
              <div className="border rounded-lg overflow-hidden">
                {/* Fila principal: estado + botón */}
                <div className="p-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    {isConnecting ? (
                      <Loader2 className="h-4 w-4 animate-spin text-primary shrink-0" />
                    ) : (
                      <span className={`inline-block h-2.5 w-2.5 rounded-full shrink-0 ${
                        isConnected ? 'bg-green-500' : 'bg-muted-foreground/40'
                      }`} />
                    )}
                    <span className="text-sm font-medium truncate">
                      {isConnecting
                        ? 'Esperando selección de impresora…'
                        : isConnected
                        ? 'Impresora conectada'
                        : 'Sin conexión'}
                    </span>
                  </div>

                  {!isConnecting && (
                    <Button
                      size="sm"
                      variant={isConnected ? 'outline' : 'default'}
                      onClick={isConnected ? disconnect : connect}
                      className="shrink-0 cursor-pointer"
                    >
                      <Printer className="h-4 w-4 mr-2" />
                      {isConnected ? 'Desconectar' : 'Seleccionar impresora'}
                    </Button>
                  )}
                </div>

                {/* Error — rol alert para accesibilidad */}
                {error && (
                  <div
                    role="alert"
                    className="border-t bg-destructive/5 px-4 py-3 flex items-start gap-2.5"
                  >
                    <AlertCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-destructive font-medium">No se pudo conectar</p>
                      <p className="text-xs text-destructive/80 mt-0.5">{WEB_SERIAL_ERROR_LABELS[error]}</p>
                    </div>
                    <button
                      type="button"
                      onClick={clearError}
                      className="text-destructive/60 hover:text-destructive transition-colors cursor-pointer shrink-0"
                      aria-label="Cerrar error"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}

                {/* Info del dispositivo conectado */}
                {isConnected && nombreDispositivo && (
                  <div className="border-t bg-muted/30 px-4 py-2.5 flex items-center gap-2">
                    <Usb className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <span className="text-xs text-muted-foreground truncate">{nombreDispositivo}</span>
                    {info?.esZebra && (
                      <Badge variant="secondary" className="text-xs ml-auto shrink-0">
                        Zebra detectada
                      </Badge>
                    )}
                  </div>
                )}

                {/* Probar conexión */}
                {isConnected && (
                  <div className="border-t px-4 py-3 flex items-center gap-3">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleProbarConexion}
                      disabled={probando}
                      className="cursor-pointer"
                    >
                      {probando
                        ? <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        : <Printer className="h-4 w-4 mr-2" />
                      }
                      {probando ? 'Probando…' : 'Probar conexión'}
                    </Button>

                    {resultadoPrueba === 'ok' && (
                      <span className="flex items-center gap-1.5 text-sm text-green-600" role="status">
                        <CheckCircle2 className="h-4 w-4" />
                        Canal OK
                      </span>
                    )}
                    {resultadoPrueba === 'error' && (
                      <span className="flex items-center gap-1.5 text-sm text-destructive" role="alert">
                        <AlertCircle className="h-4 w-4" />
                        Sin respuesta — revisá que la Zebra esté encendida
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Recordatorio modo sistema */}
            {config.modo === 'sistema' && (
              <p className="text-xs text-muted-foreground bg-muted/40 rounded px-3 py-2">
                El diálogo de impresión del OS se abrirá al imprimir. Seleccioná la Zebra GK420T y configurá el tamaño de página a {config.ancho_mm}×{config.alto_mm}mm.
              </p>
            )}
          </div>

          <Button onClick={guardar} className="w-full">
            {guardado ? '✓ Guardado en esta máquina' : 'Guardar configuración'}
          </Button>
        </div>

        {/* Columna derecha: preview */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Vista previa de etiqueta
          </h3>
          <div className="flex flex-col items-start gap-2">
            <EtiquetaPreview variante={VARIANTE_EJEMPLO} config={config} escala={3} />
            <span className="text-xs text-muted-foreground">
              {config.ancho_mm} × {config.alto_mm} mm · {config.campos.length} campo(s) activo(s)
            </span>
          </div>
          <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t">
            <p className="font-medium text-foreground">Modo activo: {config.modo === 'web-serial' ? 'Web Serial (ZPL directo)' : 'Sistema (window.print)'}</p>
            {config.modo === 'web-serial' && !isConnected && (
              <p className="text-amber-600">⚠ Conectá la impresora en el panel izquierdo antes de imprimir</p>
            )}
            {config.modo === 'web-serial' && isConnected && (
              <p className="text-green-600">✓ Listo para imprimir en modo ZPL nativo</p>
            )}
            {config.modo === 'sistema' && (
              <p>Al imprimir se abrirá el diálogo del OS — seleccioná la Zebra</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
