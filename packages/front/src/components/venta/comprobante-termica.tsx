'use client';

import React from 'react';
import { Venta } from '@/types';

function fmt(v: string | number | undefined) {
  return parseFloat(String(v || '0')).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function Linea({ texto }: { texto: string }) {
  return <p style={{ borderBottom: '1px dashed #ccc', margin: '2px 0' }}>{' '}</p>;
}

interface ComprobanteTermicaProps {
  venta: Venta;
  razonSocial?: string;
  puntoVenta?: string;
}

export function ComprobanteTermica({ venta, razonSocial, puntoVenta }: ComprobanteTermicaProps) {
  const comp = venta.comprobante;
  const numero = comp?.numero
    ? `${(comp.puntoVenta ?? puntoVenta ?? '0001').padStart(4, '0')}-${String(comp.numero).padStart(8, '0')}`
    : '----';

  return (
    <div
      className="bg-white text-black"
      style={{
        width: '80mm',
        fontFamily: 'monospace',
        fontSize: '11px',
        padding: '4mm 3mm',
        boxSizing: 'border-box',
      }}
    >
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '6px' }}>
        <p style={{ fontWeight: 700, fontSize: '13px' }}>{razonSocial ?? 'Mi Empresa S.A.'}</p>
        <p>Responsable Inscripto</p>
        <p style={{ fontWeight: 700, fontSize: '16px', border: '1px solid black', display: 'inline-block', padding: '2px 8px', margin: '4px 0' }}>
          {comp?.tipo === 'fiscal' ? 'FACTURA' : 'COMP.'} {venta.tipoComprobante}
        </p>
        <p>Nº {numero}</p>
        <p>Fecha: {comp?.fechaEmision ?? venta.fecha}</p>
      </div>

      <p style={{ borderTop: '1px dashed #333', margin: '4px 0' }} />

      {/* Cliente */}
      {venta.cliente && (
        <div style={{ marginBottom: '4px' }}>
          <p>Cliente: {venta.cliente.nombre}</p>
          {venta.cliente.cuit && <p>CUIT: {venta.cliente.cuit}</p>}
          {venta.cliente.condicionIva && <p>Cond. IVA: {venta.cliente.condicionIva}</p>}
        </div>
      )}

      {venta.vendedor && (
        <p style={{ marginBottom: '4px' }}>
          Vendedor: {venta.vendedor.nombre} {venta.vendedor.apellido}
        </p>
      )}

      <p style={{ borderTop: '1px dashed #333', margin: '4px 0' }} />

      {/* Items */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '4px' }}>
        <thead>
          <tr style={{ fontSize: '9px', color: '#555' }}>
            <th style={{ textAlign: 'left' }}>Artículo</th>
            <th style={{ textAlign: 'center', width: '30px' }}>Cant</th>
            <th style={{ textAlign: 'right', width: '60px' }}>Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {(venta.detalles ?? []).map((d, i) => (
            <tr key={i}>
              <td style={{ paddingBottom: '2px' }}>
                <p style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '120px' }}>
                  {d.articuloVariante?.articulo?.nombre ?? `#${d.articuloVarianteId}`}
                </p>
                <p style={{ fontSize: '9px', color: '#555' }}>
                  {d.articuloVariante?.talle?.codigo} ${fmt(d.precioUnitario)} c/u
                </p>
              </td>
              <td style={{ textAlign: 'center' }}>{d.cantidad}</td>
              <td style={{ textAlign: 'right', fontWeight: 600 }}>${fmt(d.subtotalLinea)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <p style={{ borderTop: '1px dashed #333', margin: '4px 0' }} />

      {/* Totales */}
      <div style={{ marginBottom: '4px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Subtotal:</span><span>${fmt(venta.subtotal)}</span>
        </div>
        {venta.descuentoPorcentaje && (
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Descuento {venta.descuentoPorcentaje}%:</span>
            <span>-${fmt(parseFloat(venta.subtotal) * parseFloat(venta.descuentoPorcentaje) / 100)}</span>
          </div>
        )}
        {venta.descuentoMonto && (
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Descuento $:</span><span>-${fmt(venta.descuentoMonto)}</span>
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Base imponible:</span><span>${fmt(venta.baseImponible)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>IVA 21%:</span><span>${fmt(venta.iva)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '13px', borderTop: '1px solid #333', paddingTop: '2px', marginTop: '2px' }}>
          <span>TOTAL:</span><span>${fmt(venta.total)}</span>
        </div>
      </div>

      <p style={{ borderTop: '1px dashed #333', margin: '4px 0' }} />

      {/* Formas de pago */}
      {venta.formasPago && venta.formasPago.length > 0 && (
        <div style={{ marginBottom: '4px', fontSize: '10px' }}>
          {venta.formasPago.map((fp, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>
                {fp.metodoPago?.nombre ?? `Método #${fp.metodoPagoId}`}
                {fp.cantidadCuotas > 1 ? ` ${fp.cantidadCuotas}x` : ''}
              </span>
              <span>${fmt(fp.montoConInteres)}</span>
            </div>
          ))}
        </div>
      )}

      {comp?.cae && (
        <>
          <p style={{ borderTop: '1px dashed #333', margin: '4px 0' }} />
          <div style={{ fontSize: '9px', textAlign: 'center' }}>
            <p>CAE: {comp.cae}</p>
            <p>Vto. CAE: {comp.caeVencimiento}</p>
          </div>
        </>
      )}

      <p style={{ borderTop: '1px dashed #333', margin: '4px 0' }} />
      <p style={{ textAlign: 'center', fontSize: '10px' }}>¡Gracias por su compra!</p>
    </div>
  );
}
