import { BadRequestException, HttpException, Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-local";
import { AuthService } from "../auth.service";

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'email',
      passwordField: 'password',
    });
  }

  async validate(email: string, password: string) {
    const usuario = await this.authService.validateUsuario(
      email,
      password
    );

    if (!usuario) {
      throw new BadRequestException('Usuario o contraseña incorrectos');
    }

    if (!usuario.active) {
      throw new HttpException('Usuario inactivo', 423);
    }

    return usuario;
  }
}