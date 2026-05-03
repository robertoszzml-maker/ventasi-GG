import { ApiProperty } from "@nestjs/swagger";
import { IsDate, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateMensajeDto {
  @ApiProperty()
  @IsNumber()
  tipoId: number;

  @ApiProperty()
  @IsString()
  tipo: string;

  @ApiProperty()
  @IsDate()
  @IsOptional()
  fecha?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  mensaje?: string;

  @ApiProperty()
  @IsNumber()
  usuarioOrigenId: number;

  @ApiProperty()
  @IsString()
  @IsOptional()
  usuarioOrigenNombre?: string;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  usuarioDestino?: number;

  @ApiProperty()
  @IsString()
  @IsOptional()
  usuarioDestinoNombre?: string;

  @ApiProperty()
  @IsDate()
  @IsOptional()
  fecha_visto?: string;
}