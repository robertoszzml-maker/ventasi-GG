import { PayloadTokenWithRefreshToken } from '@/interfaces/auth';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../../decorators/role/role.decorator';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const roles = this.reflector.get(ROLES_KEY, context.getHandler()) as number[];
    if (roles === undefined || !roles.length) {
      return false;
    }
    const [req] = context.getArgs();
    const { role } = req.user as unknown as PayloadTokenWithRefreshToken;
    return roles.includes(role)
  }
}
