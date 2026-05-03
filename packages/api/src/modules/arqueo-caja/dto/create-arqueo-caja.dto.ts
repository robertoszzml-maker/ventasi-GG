import { TipoArqueo } from '../entities/arqueo-caja.entity';

export class ArqueoCajaDetalleDto {
  medioPagoId: number;
  montoDeclarado: string;
}

export class CreateArqueoCajaDto {
  sesionCajaId: number;
  tipo: TipoArqueo;
  detalles: ArqueoCajaDetalleDto[];
  observaciones?: string;
}
