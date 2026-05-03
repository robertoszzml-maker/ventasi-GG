import { PartialType } from '@nestjs/swagger';
import { AbrirCajaDto } from './create-sesion-caja.dto';

export class UpdateSesionCajaDto extends PartialType(AbrirCajaDto) {}
