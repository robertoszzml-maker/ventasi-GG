import { VarianteEtiqueta } from '@/types';

export type CampoEtiqueta = 'titulo' | 'talle' | 'color' | 'codigoBarras';

export type ModoImpresion = 'sistema' | 'web-serial';

export type EtiquetaConfig = {
  ancho_mm: number;
  alto_mm: number;
  campos: CampoEtiqueta[];
  modo: ModoImpresion;
};

export const CONFIG_DEFAULT: EtiquetaConfig = {
  ancho_mm: 50,
  alto_mm: 30,
  campos: ['titulo', 'talle', 'color', 'codigoBarras'],
  modo: 'sistema',
};

export type ItemEtiqueta = {
  variante: VarianteEtiqueta;
  cantidad: number;
};

export type DatosEtiqueta = {
  items: ItemEtiqueta[];
  config: EtiquetaConfig;
};

export function generarCodigoBarras(variante: VarianteEtiqueta): string {
  if (variante.codigoBarras) return variante.codigoBarras;
  const art = String(variante.articuloId).padStart(4, '0');
  const tal = String(variante.varianteId).padStart(6, '0');
  return `ART${art}V${tal}`;
}

export function codificarDatosEtiqueta(datos: DatosEtiqueta): string {
  return btoa(unescape(encodeURIComponent(JSON.stringify(datos))));
}

export function decodificarDatosEtiqueta(encoded: string): DatosEtiqueta {
  return JSON.parse(decodeURIComponent(escape(atob(encoded))));
}

export function generarZpl(items: ItemEtiqueta[], config: EtiquetaConfig): string {
  const anchoDots = Math.round((config.ancho_mm / 25.4) * 203);
  const altoDots = Math.round((config.alto_mm / 25.4) * 203);

  return items
    .filter((item) => item.cantidad > 0)
    .map((item) => {
      const codigo = generarCodigoBarras(item.variante);
      const lineas: string[] = [];
      lineas.push(`^XA`);
      lineas.push(`^PW${anchoDots}`);
      lineas.push(`^LL${altoDots}`);

      let posY = 10;

      if (config.campos.includes('titulo')) {
        lineas.push(`^FO10,${posY}^A0N,22,22^FD${item.variante.articuloNombre}^FS`);
        posY += 28;
      }

      if (config.campos.includes('talle') || config.campos.includes('color')) {
        const partes: string[] = [];
        if (config.campos.includes('talle')) partes.push(`T: ${item.variante.talleNombre}`);
        if (config.campos.includes('color')) partes.push(`C: ${item.variante.colorNombre}`);
        lineas.push(`^FO10,${posY}^A0N,18,18^FD${partes.join('  ')}^FS`);
        posY += 24;
      }

      if (config.campos.includes('codigoBarras')) {
        lineas.push(`^FO10,${posY}^BY2^BCN,40,Y,N,N^FD${codigo}^FS`);
      }

      lineas.push(`^PQ${item.cantidad}`);
      lineas.push(`^XZ`);
      return lineas.join('\n');
    })
    .join('\n');
}
