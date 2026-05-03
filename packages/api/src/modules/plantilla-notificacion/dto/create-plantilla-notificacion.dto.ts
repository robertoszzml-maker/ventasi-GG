import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreatePlantillaNotificacionDto {
    @IsString()
    @MaxLength(100)
    nombre: string;

    @IsOptional()
    @IsString()
    @MaxLength(500)
    descripcion?: string;

    @IsOptional()
    @IsString()
    @MaxLength(255)
    asunto?: string;

    @IsString()
    cuerpo: string;
}
