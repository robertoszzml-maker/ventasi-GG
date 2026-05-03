import { PayloadTokenWithRefreshToken } from '@/interfaces/auth';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../../decorators/require-permissions/require-permissions.decorator';
import { PermissionsService } from '../../permissions/permissions.service';

@Injectable()
export class AuthorizationGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly permissionsService: PermissionsService,
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.get<string[]>(PERMISSIONS_KEY, context.getHandler());


    if (!requiredPermissions || !requiredPermissions.length) {
      return true;
    }

    const [req] = context.getArgs();
    const { role } = req.user as unknown as PayloadTokenWithRefreshToken;

    // Verificar si el rol tiene los permisos requeridos (incluyendo herencia)
    const hasPermission = await this.permissionsService.roleHasPermissions(role, requiredPermissions);
    return hasPermission;
  }
}
