import { IsNumber, IsNotEmpty, IsArray } from 'class-validator';

export class CreateRolePermissionDto {
  @IsNumber()
  @IsNotEmpty()
  roleId: number;

  @IsNumber()
  @IsNotEmpty()
  permissionId: number;
}

export class SetRolePermissionsDto {
  @IsNumber()
  @IsNotEmpty()
  roleId: number;

  @IsArray()
  @IsNumber({}, { each: true })
  permissionIds: number[];
}
