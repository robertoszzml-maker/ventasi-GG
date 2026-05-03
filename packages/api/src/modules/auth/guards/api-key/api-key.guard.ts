import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';

import { MESSAGE_UNAUTHORIZED } from '@/constants/sistema';
import configAuth from '@/config/auth.config';
import { IS_PUBLIC_KEY } from '../../decorators/public/public.decorator';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @Inject(configAuth.KEY)
    private configService: ConfigType<typeof configAuth>,
  ) { }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const isPublic = this.reflector.get(IS_PUBLIC_KEY, context.getHandler());
    if (isPublic) {
      return true;
    }
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers;
    const app = Object.keys(authHeader).find((e) => e === 'app');
    const isAuth = authHeader[app] === this.configService.app;
    if (!isAuth) {
      throw new UnauthorizedException(MESSAGE_UNAUTHORIZED);
    }
    return isAuth;
  }
}
