import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsInt } from 'class-validator';
import { Role } from '../../role/entities/role.entity';

export class CreateUsuarioDto {
  @ApiProperty()
  @IsString()
  email: string;

  @ApiProperty()
  @IsString()
  password?: string;

  @ApiProperty()
  @IsString()
  nombre?: string;

  @ApiProperty()
  @IsNumber()
  active?: number;

  @ApiProperty()
  @IsNumber()
  permisoId?: number;


  @ApiProperty()
  @IsString()
  refreshToken?: string;

  @ApiProperty()
  @IsString()
  telefono?: string;

  @ApiProperty()
  @IsString()
  telefonoOtro?: string;

  @ApiProperty()
  @IsNumber()
  attemps?: number;

  @ApiProperty()
  @IsNumber()
  roleId?: number;



  // @ApiProperty()
  // @IsDate()
  // createdAt: Date;

  // @ApiProperty()
  // @IsDate()
  // updatedAt: Date;

  // @ApiProperty()
  // @IsDate()
  // deletedAt: Date;
}

