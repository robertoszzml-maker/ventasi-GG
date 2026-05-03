import { TipoConcepto } from '../entities/concepto-movimiento.entity';

export class CreateConceptoMovimientoDto {
  nombre: string;
  tipo: TipoConcepto;
  activo?: number;
}
