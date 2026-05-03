'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import { EtiquetaLabelPrint } from '@/components/etiqueta/etiqueta-label-print';
import { decodificarDatosEtiqueta, generarZpl, DatosEtiqueta } from '@/lib/etiqueta';
import { useWebSerial } from '@/hooks/use-web-serial';

function PrintContent() {
  const searchParams = useSearchParams();
  const encoded = searchParams.get('data');
  const [estado, setEstado] = React.useState<'cargando' | 'listo' | 'imprimiendo' | 'error'>('cargando');
  const [datos, setDatos] = React.useState<DatosEtiqueta | null>(null);
  const { print: serialPrint, connect } = useWebSerial();

  React.useEffect(() => {
    if (!encoded) { setEstado('error'); return; }
    try {
      setDatos(decodificarDatosEtiqueta(encoded));
      setEstado('listo');
    } catch {
      setEstado('error');
    }
  }, [encoded]);

  React.useEffect(() => {
    if (estado !== 'listo' || !datos) return;

    if (datos.config.modo === 'web-serial') {
      setEstado('imprimiendo');
      const ejecutar = async () => {
        const ok = await connect();
        if (!ok) { setEstado('error'); return; }
        const zpl = generarZpl(datos.items, datos.config);
        await serialPrint(zpl);
        window.close();
      };
      ejecutar();
    } else {
      const timer = setTimeout(() => window.print(), 500);
      return () => clearTimeout(timer);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [estado, datos]);

  if (estado === 'error') {
    return <div style={centeredStyle}><p>Error al procesar los datos de impresión.</p></div>;
  }

  if (estado === 'cargando' || !datos) {
    return <div style={centeredStyle}><p>Preparando etiquetas...</p></div>;
  }

  if (datos.config.modo === 'web-serial') {
    return (
      <div style={centeredStyle}>
        <p>{estado === 'imprimiendo' ? 'Enviando a impresora...' : 'Listo'}</p>
      </div>
    );
  }

  // Modo sistema: una página CSS por etiqueta
  const etiquetas: Array<DatosEtiqueta['items'][0]['variante']> = [];
  datos.items.forEach((item) => {
    for (let i = 0; i < item.cantidad; i++) {
      etiquetas.push(item.variante);
    }
  });

  const { ancho_mm, alto_mm } = datos.config;

  return (
    <>
      {/* Dimensiones de página exactas + sin márgenes para evitar headers/footers del browser */}
      <style>{`
        @media print {
          @page {
            size: ${ancho_mm}mm ${alto_mm}mm;
            margin: 0;
          }
        }
      `}</style>

      {etiquetas.map((variante, i) => (
        <div
          key={i}
          style={{
            width: `${ancho_mm}mm`,
            height: `${alto_mm}mm`,
            pageBreakAfter: i < etiquetas.length - 1 ? 'always' : 'avoid',
            breakAfter: i < etiquetas.length - 1 ? 'page' : 'avoid',
            overflow: 'hidden',
          }}
        >
          <EtiquetaLabelPrint variante={variante} config={datos.config} />
        </div>
      ))}
    </>
  );
}

const centeredStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '100vh',
  fontFamily: 'sans-serif',
};

export default function PrintEtiquetasPage() {
  return (
    <>
      <style>{`
        * { box-sizing: border-box; }

        @media screen {
          body {
            background: #e5e7eb;
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            padding: 24px;
            gap: 4px;
          }
        }

        @media print {
          html, body {
            background: white !important;
            margin: 0 !important;
            padding: 0 !important;
            width: auto !important;
            height: auto !important;
          }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>
      <React.Suspense fallback={<p style={{ fontFamily: 'sans-serif', padding: '24px' }}>Cargando...</p>}>
        <PrintContent />
      </React.Suspense>
    </>
  );
}
