'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

const ZEBRA_VENDOR_ID = 0x0A5F;

export type WebSerialInfo = {
  usbVendorId?: number;
  usbProductId?: number;
  esZebra: boolean;
};

export type WebSerialError =
  | 'cancelado'       // usuario cerró el picker sin seleccionar
  | 'puerto_ocupado'  // el puerto ya lo tiene otra app
  | 'sin_puertos'     // no hay dispositivos serie disponibles
  | 'permiso_denegado'
  | 'desconocido';

function clasificarError(err: unknown): WebSerialError {
  const msg = err instanceof Error ? err.message.toLowerCase() : '';
  if (msg.includes('no port selected') || msg.includes('user cancelled') || msg.includes('user canceled')) return 'cancelado';
  if (msg.includes('access denied') || msg.includes('failed to open')) return 'puerto_ocupado';
  if (msg.includes('no available ports')) return 'sin_puertos';
  if (msg.includes('permission') || msg.includes('denied')) return 'permiso_denegado';
  return 'desconocido';
}

export const WEB_SERIAL_ERROR_LABELS: Record<WebSerialError, string> = {
  cancelado: 'No se seleccionó ninguna impresora.',
  puerto_ocupado: 'El puerto está siendo usado por otra aplicación. Cerrala y reintentá.',
  sin_puertos: 'No se encontraron dispositivos serie USB conectados.',
  permiso_denegado: 'Chrome denegó el acceso al puerto. Revisá los permisos del sitio.',
  desconocido: 'No se pudo conectar a la impresora.',
};

export function useWebSerial() {
  const [isAvailable, setIsAvailable] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<WebSerialError | null>(null);
  const [info, setInfo] = useState<WebSerialInfo | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const portRef = useRef<any>(null);

  useEffect(() => {
    const disponible = typeof navigator !== 'undefined' && 'serial' in navigator;
    setIsAvailable(disponible);
    if (!disponible) return;

    const intentarReconectar = async () => {
      try {
        const puertos = await (navigator as any).serial.getPorts();
        if (puertos.length === 0) return;
        const port = puertos[0];
        await port.open({ baudRate: 9600 });
        portRef.current = port;
        const portInfo = port.getInfo?.() ?? {};
        setInfo({
          usbVendorId: portInfo.usbVendorId,
          usbProductId: portInfo.usbProductId,
          esZebra: portInfo.usbVendorId === ZEBRA_VENDOR_ID,
        });
        setIsConnected(true);
      } catch {
        // sin puerto previo — silencioso en el montaje inicial
      }
    };
    intentarReconectar();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const connect = useCallback(async (): Promise<boolean> => {
    if (!isAvailable) return false;
    setIsConnecting(true);
    setError(null);
    try {
      const port = await (navigator as any).serial.requestPort();
      await port.open({ baudRate: 9600 });
      portRef.current = port;
      const portInfo = port.getInfo?.() ?? {};
      setInfo({
        usbVendorId: portInfo.usbVendorId,
        usbProductId: portInfo.usbProductId,
        esZebra: portInfo.usbVendorId === ZEBRA_VENDOR_ID,
      });
      setIsConnected(true);
      return true;
    } catch (err) {
      const tipo = clasificarError(err);
      // "cancelado" no es un error que mostrar como alerta — el usuario lo hizo a propósito
      if (tipo !== 'cancelado') setError(tipo);
      setIsConnected(false);
      return false;
    } finally {
      setIsConnecting(false);
    }
  }, [isAvailable]);

  const clearError = useCallback(() => setError(null), []);

  const testConnection = useCallback(async (): Promise<boolean> => {
    if (!portRef.current) return false;
    try {
      const writer = portRef.current.writable?.getWriter();
      if (!writer) return false;
      await writer.write(new TextEncoder().encode('~HS'));
      writer.releaseLock();
      return true;
    } catch {
      return false;
    }
  }, []);

  const print = useCallback(async (zpl: string): Promise<boolean> => {
    if (!portRef.current) return false;
    try {
      const writer = portRef.current.writable?.getWriter();
      if (!writer) return false;
      await writer.write(new TextEncoder().encode(zpl));
      writer.releaseLock();
      return true;
    } catch {
      return false;
    }
  }, []);

  const disconnect = useCallback(async () => {
    if (!portRef.current) return;
    try { await portRef.current.close(); } finally {
      portRef.current = null;
      setIsConnected(false);
      setInfo(null);
      setError(null);
    }
  }, []);

  return {
    isAvailable, isConnected, isConnecting, error, info,
    connect, clearError, testConnection, print, disconnect,
  };
}
