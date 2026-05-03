'use client';

import React, { useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';
import { EtiquetaConfig, generarCodigoBarras } from '@/lib/etiqueta';
import { VarianteEtiqueta } from '@/types';

type Props = {
  variante: VarianteEtiqueta;
  config: EtiquetaConfig;
};

export function EtiquetaLabelPrint({ variante, config }: Props) {
  const barcodeRef = useRef<SVGSVGElement>(null);
  const codigo = generarCodigoBarras(variante);

  useEffect(() => {
    if (barcodeRef.current && config.campos.includes('codigoBarras')) {
      try {
        JsBarcode(barcodeRef.current, codigo, {
          format: 'CODE128',
          displayValue: true,
          fontSize: 7,        // pt — absoluto en impresión
          height: 28,         // pt ≈ 10mm
          margin: 0,
          background: 'transparent',
          lineColor: '#000000',
        });
      } catch {
        // código inválido
      }
    }
  }, [codigo, config.campos]);

  return (
    <div
      style={{
        width: `${config.ancho_mm}mm`,
        height: `${config.alto_mm}mm`,
        padding: '1.5mm',
        boxSizing: 'border-box',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.8mm',
        fontFamily: 'Arial, sans-serif',
        backgroundColor: '#ffffff',
      }}
    >
      {config.campos.includes('titulo') && (
        <div
          style={{
            fontSize: '6pt',
            fontWeight: 'bold',
            lineHeight: 1.1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {variante.articuloNombre}
        </div>
      )}

      {(config.campos.includes('talle') || config.campos.includes('color')) && (
        <div style={{ fontSize: '5.5pt', display: 'flex', gap: '2mm' }}>
          {config.campos.includes('talle') && (
            <span><strong>T:</strong> {variante.talleNombre}</span>
          )}
          {config.campos.includes('color') && (
            <span><strong>C:</strong> {variante.colorNombre}</span>
          )}
        </div>
      )}

      {config.campos.includes('codigoBarras') && (
        <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', minHeight: 0 }}>
          <svg ref={barcodeRef} style={{ width: '100%', maxHeight: '100%' }} />
        </div>
      )}
    </div>
  );
}
