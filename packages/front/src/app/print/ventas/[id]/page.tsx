'use client';

import React from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { ComprobanteA4 } from '@/components/venta/comprobante-a4';
import { ComprobanteTermica } from '@/components/venta/comprobante-termica';
import { useGetVentaByIdQuery } from '@/hooks/venta';

function PrintContent() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const formato = (searchParams.get('formato') as 'a4' | 'termica') ?? 'a4';
  const ventaId = parseInt(id);

  const { data: venta, isLoading } = useGetVentaByIdQuery(ventaId);

  React.useEffect(() => {
    if (!isLoading && venta) {
      const timer = setTimeout(() => window.print(), 400);
      return () => clearTimeout(timer);
    }
  }, [isLoading, venta]);

  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', fontFamily: 'sans-serif' }}>
        <p>Cargando comprobante...</p>
      </div>
    );
  }

  if (!venta) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', fontFamily: 'sans-serif' }}>
        <p>Venta no encontrada</p>
      </div>
    );
  }

  return formato === 'a4' ? <ComprobanteA4 venta={venta} /> : <ComprobanteTermica venta={venta} />;
}

export default function PrintVentaPage() {
  return (
    <>
      <style>{`
        @media screen {
          body { background: #e5e7eb; display: flex; justify-content: center; padding: 24px; }
        }
        @media print {
          @page { size: A4; margin: 0; }
          body { background: white !important; margin: 0 !important; padding: 0 !important; display: block !important; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        }
      `}</style>
      <React.Suspense fallback={<p style={{ fontFamily: 'sans-serif', padding: '24px' }}>Cargando...</p>}>
        <PrintContent />
      </React.Suspense>
    </>
  );
}
