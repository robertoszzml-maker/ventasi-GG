import { PayloadToken, PayloadTokenWithRefreshToken } from '@/interfaces/auth';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { FastifyRequest } from 'fastify';

import { ExtractJwt, Strategy } from 'passport-jwt';
import configAuth from 'src/config/auth.config';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(
    @Inject(configAuth.KEY)
    private configService: ConfigType<typeof configAuth>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.jwtRefreshSecret,
      passReqToCallback: true,
    });
  }

  validate(req: FastifyRequest, payload: PayloadToken): PayloadTokenWithRefreshToken {
    let refreshToken = req.headers.authorization.split(' ')[1]
    return { ...payload, refreshToken };
  }
}
