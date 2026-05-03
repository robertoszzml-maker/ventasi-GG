import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'role';

export const Role = (rol: number[]) => SetMetadata(ROLES_KEY, rol);