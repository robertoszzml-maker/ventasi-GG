'use client';

import React from 'react';

export type TipoSilueta =
  | 'remera'
  | 'camisa'
  | 'pantalon'
  | 'short'
  | 'vestido'
  | 'campera'
  | 'zapatillas'
  | 'calzas'
  | 'medias'
  | 'buzo'
  | 'bermuda';

export const SILUETAS: { value: TipoSilueta; label: string }[] = [
  { value: 'remera', label: 'Remera' },
  { value: 'camisa', label: 'Camisa' },
  { value: 'pantalon', label: 'Pantalón' },
  { value: 'short', label: 'Short' },
  { value: 'vestido', label: 'Vestido' },
  { value: 'campera', label: 'Campera' },
  { value: 'buzo', label: 'Buzo' },
  { value: 'bermuda', label: 'Bermuda' },
  { value: 'zapatillas', label: 'Zapatillas' },
  { value: 'calzas', label: 'Calzas' },
  { value: 'medias', label: 'Medias' },
];

interface SiluetaSvgProps {
  tipo: TipoSilueta;
  /** Un solo color hex (retrocompatibilidad) */
  color?: string;
  /** Múltiples colores hex — divide la silueta en franjas horizontales */
  colores?: string[];
  size?: number;
  className?: string;
}

type ShapeDef = {
  /** Nodos SVG para usar dentro de <clipPath> */
  clip: React.ReactNode;
  /** Nodos SVG para dibujar el contorno encima */
  outline: React.ReactNode;
  /** Detalles decorativos (botones, costuras, etc.) */
  extras?: React.ReactNode;
};

export function SiluetaSvg({ tipo, color = '#94a3b8', colores, size = 48, className }: SiluetaSvgProps) {
  const uid = React.useId().replace(/:/g, '');
  const clipId = `sc-${uid}`;
  const stroke = 'rgba(0,0,0,0.18)';

  const efectiveColores = colores && colores.length > 0 ? colores : [color];
  const stripeH = 48 / efectiveColores.length;

  const shapes: Record<TipoSilueta, ShapeDef> = {
    remera: {
      clip: <path d="M16 6 L6 12 L10 18 L14 16 L14 40 L34 40 L34 16 L38 18 L42 12 L32 6 C30 10 18 10 16 6Z" />,
      outline: <path d="M16 6 L6 12 L10 18 L14 16 L14 40 L34 40 L34 16 L38 18 L42 12 L32 6 C30 10 18 10 16 6Z" fill="none" stroke={stroke} strokeWidth="1" />,
    },
    camisa: {
      clip: <path d="M16 6 L6 12 L10 18 L14 16 L14 40 L34 40 L34 16 L38 18 L42 12 L32 6 C30 10 18 10 16 6Z" />,
      outline: <path d="M16 6 L6 12 L10 18 L14 16 L14 40 L34 40 L34 16 L38 18 L42 12 L32 6 C30 10 18 10 16 6Z" fill="none" stroke={stroke} strokeWidth="1" />,
      extras: <>
        <line x1="24" y1="10" x2="24" y2="40" stroke={stroke} strokeWidth="1.5" />
        <line x1="21" y1="13" x2="27" y2="13" stroke={stroke} strokeWidth="1" />
        <line x1="21" y1="17" x2="27" y2="17" stroke={stroke} strokeWidth="1" />
      </>,
    },
    buzo: {
      clip: <path d="M16 6 L6 12 L10 18 L14 16 L14 40 L34 40 L34 16 L38 18 L42 12 L32 6 C30 10 18 10 16 6Z" />,
      outline: <path d="M16 6 L6 12 L10 18 L14 16 L14 40 L34 40 L34 16 L38 18 L42 12 L32 6 C30 10 18 10 16 6Z" fill="none" stroke={stroke} strokeWidth="1" />,
      extras: <path d="M14 22 Q24 26 34 22" stroke={stroke} strokeWidth="1.5" fill="none" />,
    },
    campera: {
      clip: <path d="M16 6 L6 12 L10 18 L14 16 L14 42 L34 42 L34 16 L38 18 L42 12 L32 6 C30 10 18 10 16 6Z" />,
      outline: <path d="M16 6 L6 12 L10 18 L14 16 L14 42 L34 42 L34 16 L38 18 L42 12 L32 6 C30 10 18 10 16 6Z" fill="none" stroke={stroke} strokeWidth="1" />,
      extras: <>
        <line x1="24" y1="10" x2="24" y2="42" stroke={stroke} strokeWidth="2" />
        <path d="M14 28 Q24 32 34 28" stroke={stroke} strokeWidth="1.5" fill="none" />
      </>,
    },
    pantalon: {
      clip: <path d="M8 6 L8 24 L18 24 L24 42 L30 24 L40 24 L40 6 Z" />,
      outline: <path d="M8 6 L8 24 L18 24 L24 42 L30 24 L40 24 L40 6 Z" fill="none" stroke={stroke} strokeWidth="1" />,
      extras: <line x1="8" y1="12" x2="40" y2="12" stroke={stroke} strokeWidth="1" />,
    },
    short: {
      clip: <path d="M8 10 L8 26 L18 26 L24 34 L30 26 L40 26 L40 10 Z" />,
      outline: <path d="M8 10 L8 26 L18 26 L24 34 L30 26 L40 26 L40 10 Z" fill="none" stroke={stroke} strokeWidth="1" />,
      extras: <line x1="8" y1="16" x2="40" y2="16" stroke={stroke} strokeWidth="1" />,
    },
    bermuda: {
      clip: <path d="M8 10 L8 30 L18 32 L24 38 L30 32 L40 30 L40 10 Z" />,
      outline: <path d="M8 10 L8 30 L18 32 L24 38 L30 32 L40 30 L40 10 Z" fill="none" stroke={stroke} strokeWidth="1" />,
      extras: <line x1="8" y1="16" x2="40" y2="16" stroke={stroke} strokeWidth="1" />,
    },
    vestido: {
      clip: <path d="M18 4 L14 8 L10 14 L14 16 L10 44 L38 44 L34 16 L38 14 L34 8 L30 4 C28 7 20 7 18 4Z" />,
      outline: <path d="M18 4 L14 8 L10 14 L14 16 L10 44 L38 44 L34 16 L38 14 L34 8 L30 4 C28 7 20 7 18 4Z" fill="none" stroke={stroke} strokeWidth="1" />,
      extras: <line x1="14" y1="22" x2="34" y2="22" stroke={stroke} strokeWidth="1" />,
    },
    zapatillas: {
      clip: <path d="M6 30 L6 20 L14 14 L22 16 L28 14 L36 18 L42 26 L42 32 L32 34 L6 32 Z" />,
      outline: <path d="M6 30 L6 20 L14 14 L22 16 L28 14 L36 18 L42 26 L42 32 L32 34 L6 32 Z" fill="none" stroke={stroke} strokeWidth="1" />,
      extras: <>
        <path d="M14 14 L14 20" stroke={stroke} strokeWidth="1.5" />
        <path d="M18 13 L18 20" stroke={stroke} strokeWidth="1.5" />
        <path d="M22 13 L22 20" stroke={stroke} strokeWidth="1.5" />
      </>,
    },
    calzas: {
      clip: <>
        <path d="M10 6 L10 26 L20 44 L24 42 L18 26 L18 6 Z" />
        <path d="M38 6 L38 26 L28 44 L24 42 L30 26 L30 6 Z" />
        <rect x="10" y="6" width="28" height="8" />
      </>,
      outline: <>
        <path d="M10 6 L10 26 L20 44 L24 42 L18 26 L18 6 Z" fill="none" stroke={stroke} strokeWidth="1" />
        <path d="M38 6 L38 26 L28 44 L24 42 L30 26 L30 6 Z" fill="none" stroke={stroke} strokeWidth="1" />
        <rect x="10" y="6" width="28" height="8" fill="none" stroke={stroke} strokeWidth="1" rx="2" />
      </>,
    },
    medias: {
      clip: <path d="M16 6 L16 28 L10 32 L8 38 L12 42 L32 42 L36 36 L30 28 L30 6 Z" />,
      outline: <path d="M16 6 L16 28 L10 32 L8 38 L12 42 L32 42 L36 36 L30 28 L30 6 Z" fill="none" stroke={stroke} strokeWidth="1" />,
      extras: <line x1="16" y1="12" x2="30" y2="12" stroke={stroke} strokeWidth="1" />,
    },
  };

  const shape = shapes[tipo];
  if (!shape) return null;

  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
      <defs>
        <clipPath id={clipId}>
          {shape.clip}
        </clipPath>
      </defs>

      {/* Franjas horizontales de color, recortadas a la silueta */}
      <g clipPath={`url(#${clipId})`}>
        {efectiveColores.map((hex, i) => (
          <rect
            key={i}
            x={0}
            y={i * stripeH}
            width={48}
            height={stripeH}
            fill={hex}
          />
        ))}
      </g>

      {/* Contorno de la silueta */}
      {shape.outline}

      {/* Detalles decorativos */}
      {shape.extras}
    </svg>
  );
}
