import { IsInt, IsOptional, Min } from 'class-validator';

export class UpdateUmbralVarianteDto {
  @IsOptional()
  @IsInt()
  @Min(0)
  stockMinimo?: number | null;

  @IsOptional()
  @IsInt()
  @Min(0)
  stockSeguridad?: number | null;

  @IsOptional()
  @IsInt()
  @Min(0)
  stockMaximo?: number | null;
}
