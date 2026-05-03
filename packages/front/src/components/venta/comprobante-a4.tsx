'use client';

import React from 'react';
import { Venta } from '@/types';

function fmt(v: string | number | undefined) {
  return parseFloat(String(v || '0')).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

interface ComprobanteA4Props {
  venta: Venta;
  razonSocial?: string;
  puntoVenta?: string;
}

export function ComprobanteA4({ venta, razonSocial, puntoVenta }: ComprobanteA4Props) {
  const comp = venta.comprobante;
  const numeroFormateado = comp?.numero
    ? `${(comp.puntoVenta ?? puntoVenta ?? '0001').padStart(4, '0')}-${String(comp.numero).padStart(8, '0')}`
    : '----';

  return (
    <div
      className="bg-white text-black font-sans"
      style={{ width: '210mm', minHeight: '297mm', padding: '15mm', boxSizing: 'border-box', fontSize: '11px' }}
    >
      {/* Encabezado */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '8px', marginBottom: '12px' }}>
        {/* Emisor */}
        <div>
          <p style={{ fontWeight: 700, fontSize: '14px' }}>{razonSocial ?? 'Mi Empresa S.A.'}</p>
          <p style={{ color: '#555' }}>Responsable Inscripto</p>
          {venta.cliente && (
            <>
              <p style={{ marginTop: '8px', fontWeight: 600 }}>Cliente:</p>
              <p>{venta.cliente.nombre}</p>
              {venta.cliente.cuit && <p>CUIT: {venta.cliente.cuit}</p>}
              {venta.cliente.condicionIva && <p>Cond. IVA: {venta.cliente.condicionIva}</p>}
              {venta.cliente.domicilio && <p>{venta.cliente.domicilio}</p>}
              {venta.cliente.localidad && <p>{venta.cliente.localidad}, {venta.cliente.provincia}</p>}
            </>
          )}
        </div>

        {/* Tipo de comprobante (centro) */}
        <div
          style={{
            border: '2px solid black',
            width: '70px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '8px',
          }}
        >
          <p style={{ fontSize: '36px', fontWeight: 900, lineHeight: 1 }}>{venta.tipoComprobante}</p>
          <p style={{ fontSize: '9px', textAlign: 'center' }}>
            {comp?.tipo === 'fiscal' ? 'FACTURA' : 'COMPROBANTE'}
          </p>
        </div>

        {/* Datos del comprobante */}
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontWeight: 700 }}>Nº {numeroFormateado}</p>
          <p>Fecha: {comp?.fechaEmision ?? venta.fecha}</p>
          {comp?.cae && (
            <>
              <p style={{ marginTop: '8px' }}>CAE: {comp.cae}</p>
              <p>Vto. CAE: {comp.caeVencimiento}</p>
            </>
          )}
          {venta.vendedor && (
            <p style={{ marginTop: '8px', color: '#555' }}>
              Vendedor: {venta.vendedor.nombre} {venta.vendedor.apellido}
            </p>
          )}
        </div>
      </div>

      <hr style={{ borderTop: '1px solid #ccc', margin: '8px 0' }} />

      {/* Tabla de artículos */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '12px' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #333', fontSize: '10px' }}>
            <th style={{ textAlign: 'left', padding: '4px 2px' }}>Artículo</th>
            <th style={{ textAlign: 'center', padding: '4px 2px', width: '50px' }}>Talle</th>
            <th style={{ textAlign: 'center', padding: '4px 2px', width: '50px' }}>Cant.</th>
            <th style={{ textAlign: 'right', padding: '4px 2px', width: '80px' }}>Precio unit.</th>
            <th style={{ textAlign: 'right', padding: '4px 2px', width: '60px' }}>Desc.</th>
            <th style={{ textAlign: 'right', padding: '4px 2px', width: '80px' }}>Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {(venta.detalles ?? []).map((d, i) => (
            <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '4px 2px' }}>
                {d.articuloVariante?.articulo?.nombre ?? `Variante #${d.articuloVarianteId}`}
              </td>
              <td style={{ textAlign: 'center', padding: '4px 2px' }}>
                {d.articuloVariante?.talle?.codigo ?? '—'}
              </td>
              <td style={{ textAlign: 'center', padding: '4px 2px' }}>{d.cantidad}</td>
              <td style={{ textAlign: 'right', padding: '4px 2px' }}>${fmt(d.precioUnitario)}</td>
              <td style={{ textAlign: 'right', padding: '4px 2px' }}>
                {d.descuentoPorcentaje ? `${d.descuentoPorcentaje}%` : d.descuentoMonto ? `$${fmt(d.descuentoMonto)}` : '—'}
              </td>
              <td style={{ textAlign: 'right', padding: '4px 2px', fontWeight: 600 }}>${fmt(d.subtotalLinea)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totales */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '12px' }}>
        <table style={{ fontSize: '11px' }}>
          <tbody>
            <tr>
              <td style={{ textAlign: 'right', paddingRight: '16px', color: '#555' }}>Subtotal:</td>
              <td style={{ textAlign: 'right', minWidth: '80px' }}>${fmt(venta.subtotal)}</td>
            </tr>
            {venta.descuentoPorcentaje && (
              <tr>
                <td style={{ textAlign: 'right', paddingRight: '16px', color: '#555' }}>
                  Descuento ({venta.descuentoPorcentaje}%):
                </td>
                <td style={{ textAlign: 'right', color: '#d00' }}>
                  -${fmt(parseFloat(venta.subtotal) * parseFloat(venta.descuentoPorcentaje) / 100)}
                </td>
              </tr>
            )}
            {venta.descuentoMonto && (
              <tr>
                <td style={{ textAlign: 'right', paddingRight: '16px', color: '#555' }}>Descuento $:</td>
                <td style={{ textAlign: 'right', color: '#d00' }}>-${fmt(venta.descuentoMonto)}</td>
              </tr>
            )}
            {venta.recargoPorcentaje && (
              <tr>
                <td style={{ textAlign: 'right', paddingRight: '16px', color: '#555' }}>
                  Recargo ({venta.recargoPorcentaje}%):
                </td>
                <td style={{ textAlign: 'right', color: '#b50' }}>
                  +${fmt(parseFloat(venta.baseImponible) * parseFloat(venta.recargoPorcentaje) / 100)}
                </td>
              </tr>
            )}
            <tr>
              <td style={{ textAlign: 'right', paddingRight: '16px', color: '#555' }}>Base imponible:</td>
              <td style={{ textAlign: 'right' }}>${fmt(venta.baseImponible)}</td>
            </tr>
            <tr>
              <td style={{ textAlign: 'right', paddingRight: '16px', color: '#555' }}>IVA 21%:</td>
              <td style={{ textAlign: 'right' }}>${fmt(venta.iva)}</td>
            </tr>
            <tr style={{ borderTop: '2px solid #333', fontWeight: 700, fontSize: '13px' }}>
              <td style={{ textAlign: 'right', paddingRight: '16px', paddingTop: '4px' }}>TOTAL:</td>
              <td style={{ textAlign: 'right', paddingTop: '4px' }}>${fmt(venta.total)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Formas de pago */}
      {venta.formasPago && venta.formasPago.length > 0 && (
        <div style={{ marginBottom: '12px' }}>
          <p style={{ fontWeight: 600, marginBottom: '4px' }}>Formas de pago:</p>
          {venta.formasPago.map((fp, i) => (
            <p key={i} style={{ fontSize: '10px' }}>
              {fp.metodoPago?.nombre ?? `Método #${fp.metodoPagoId}`}
              {fp.cantidadCuotas > 1 ? ` — ${fp.cantidadCuotas} cuotas` : ''}
              {parseFloat(fp.tasaInteres) > 0 ? ` (+${fp.tasaInteres}%)` : ''}
              {' '}${fmt(fp.montoConInteres)}
            </p>
          ))}
        </div>
      )}

      <hr style={{ borderTop: '1px solid #ccc', margin: '12px 0' }} />
      <p style={{ textAlign: 'center', fontSize: '10px', color: '#888' }}>Gracias por su compra</p>

    </div>
  );
}
