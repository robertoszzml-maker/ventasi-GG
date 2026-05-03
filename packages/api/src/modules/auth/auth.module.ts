import authConfig from '@/config/auth.config';
import { Module } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RoleModule } from './role/role.module';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { UsuarioModule } from './usuario/usuario.module';
import { RolePermissionModule } from './role-permission/role-permission.module';
import { PermissionsModule } from './permissions/permissions.module';

@Module({
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy, JwtRefreshStrategy],
  imports: [
    PassportModule.register({ session: true }),
    JwtModule.registerAsync({
      inject: [authConfig.KEY],
      useFactory: (AuthConfig: ConfigType<typeof authConfig>) => {
        return {
          secret: AuthConfig.jwtSecret,
          signOptions: {
            expiresIn: '10s',
          },
        };
      },
    }),
    UsuarioModule,
    RoleModule,
    RolePermissionModule,
    PermissionsModule,
  ],
  exports: [PermissionsModule],
})
export class AuthModule { }
