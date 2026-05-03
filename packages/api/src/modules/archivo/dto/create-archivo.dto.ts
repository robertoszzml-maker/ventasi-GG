import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateArchivoDto {
    @IsOptional()
    @IsString()
    nombre?: string;

    @IsNotEmpty()
    @IsString()
    nombreArchivo: string;
    @IsNotEmpty()
    @IsString()
    nombreArchivoOriginal: string;

    @IsOptional()
    @IsString()
    url?: string;

    @IsNotEmpty()
    @IsString()
    extension: string;

    @IsNotEmpty()
    @IsString()
    modelo: string;

    @IsNotEmpty()
    @IsNumber()
    modeloId: number;

    @IsNotEmpty()
    @IsString()
    tipo: string;
}
