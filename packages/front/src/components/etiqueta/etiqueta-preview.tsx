'use client';

import React, { useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';
import { EtiquetaConfig, generarCodigoBarras } from '@/lib/etiqueta';
import { VarianteEtiqueta } from '@/types';

type Props = {
  variante: VarianteEtiqueta;
  config: EtiquetaConfig;
  escala?: number;
};

const MM_TO_PX = 3.7795;

export function EtiquetaPreview({ variante, config, escala = 3 }: Props) {
  const barcodeRef = useRef<SVGSVGElement>(null);
  const codigo = generarCodigoBarras(variante);

  const ancho = config.ancho_mm * MM_TO_PX * escala;
  const alto = config.alto_mm * MM_TO_PX * escala;

  useEffect(() => {
    if (barcodeRef.current && config.campos.includes('codigoBarras')) {
      try {
        JsBarcode(barcodeRef.current, codigo, {
          format: 'CODE128',
          displayValue: true,
          fontSize: Math.round(9 * escala),
          height: Math.round(28 * escala),
          margin: 0,
          background: 'transparent',
          lineColor: '#1a1a1a',
          textMargin: 2,
        });
      } catch {
        // código inválido
      }
    }
  }, [codigo, config.campos, escala]);

  return (
    <div
      style={{
        width: `${ancho}px`,
        height: `${alto}px`,
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: `${3 * escala}px`,
        boxShadow: `0 ${1 * escala}px ${3 * escala}px rgba(0,0,0,0.08), 0 ${1 * escala}px ${2 * escala}px rgba(0,0,0,0.06)`,
        padding: `${5 * escala}px ${5 * escala}px ${4 * escala}px`,
        display: 'flex',
        flexDirection: 'column',
        gap: `${2 * escala}px`,
        overflow: 'hidden',
        boxSizing: 'border-box',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        flexShrink: 0,
      }}
    >
      {config.campos.includes('titulo') && (
        <div
          style={{
            fontSize: `${7 * escala}px`,
            fontWeight: 700,
            lineHeight: 1.15,
            color: '#0f172a',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            letterSpacing: '-0.01em',
          }}
        >
          {variante.articuloNombre}
        </div>
      )}

      {(config.campos.includes('talle') || config.campos.includes('color')) && (
        <div
          style={{
            fontSize: `${5.5 * escala}px`,
            display: 'flex',
            gap: `${5 * escala}px`,
            color: '#475569',
          }}
        >
          {config.campos.includes('talle') && (
            <span>
              <span style={{ fontWeight: 600, color: '#334155' }}>T</span>{' '}
              {variante.talleNombre}
            </span>
          )}
          {config.campos.includes('color') && (
            <span>
              <span style={{ fontWeight: 600, color: '#334155' }}>C</span>{' '}
              {variante.colorNombre}
            </span>
          )}
        </div>
      )}

      {config.campos.includes('codigoBarras') && (
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'flex-end',
            minHeight: 0,
          }}
        >
          <svg
            ref={barcodeRef}
            style={{ width: '100%', maxHeight: '100%', display: 'block' }}
          />
        </div>
      )}
    </div>
  );
}
