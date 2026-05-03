import { ApiProperty } from "@nestjs/swagger";
import { IsDate, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateNotificacionDto {
  @ApiProperty()
  @IsNumber()
  tipoUsuario: number;

  @ApiProperty()
  @IsOptional()
  @IsString()
  tipoNotificacion?: string;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  usuarioOrigen?: number;


  @ApiProperty()
  @IsNumber()
  usuarioOrigenId: number;


  @ApiProperty()
  @IsOptional()
  @IsNumber()
  usuarioDestino?: number;

  @ApiProperty()
  @IsOptional()
  @IsDate()
  fecha?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  nota?: string;

  @ApiProperty()
  @IsNumber()
  tipoId: number;

  @ApiProperty()
  @IsString()
  tipo: string;

  @ApiProperty()
  @IsOptional()
  @IsDate()
  fechaVisto?: string;
}
