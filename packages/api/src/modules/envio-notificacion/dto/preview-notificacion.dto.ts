import { IsObject, IsOptional, IsString } from 'class-validator';

export class PreviewNotificacionDto {
    @IsString()
    modelo: string;

    @IsOptional()
    @IsObject()
    filtros?: Record<string, unknown>;
}