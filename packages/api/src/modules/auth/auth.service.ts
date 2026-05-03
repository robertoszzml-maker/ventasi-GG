import { MENU } from '@/constants/routes';
import { USUARIO_MAXIMUM_ATTEMPTS } from '@/constants/sistema'
import authConfig from '@/config/auth.config';
import { PayloadToken } from '@/interfaces/auth';
import { CookieSerializeOptions } from '@fastify/cookie';
import { BadRequestException, Inject, Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Usuario } from './usuario/entities/usuario.entity';
import { UsuarioService } from './usuario/usuario.service';

@Injectable()
export class AuthService {
  constructor(
    private usuarioService: UsuarioService,
    private jwtService: JwtService,
    @Inject(authConfig.KEY)
    private authConst: ConfigType<typeof authConfig>,
  ) { }

  async findUsuarioById(id: number): Promise<Usuario | null> {
    return await this.usuarioService.findOneByAuth(id);
  }

  async validateUsuario(email: string, password: string): Promise<Usuario | null> {
    let result: Usuario | null = null
    const usuario = await this.usuarioService.findOneByEmail(email);
    if (usuario && usuario.attemps >= USUARIO_MAXIMUM_ATTEMPTS) {
      // await this.usuarioStatusSerive.saveStatus(
      //   usuario.id,
      //   AUTH_USUARIO_STATUS_ESTADOS.ESTADO_BLOQUEADO,
      //   usuario.id,
      // );
      throw new HttpException(
        'Usuario bloqueado, por cantidad de intentos erróneos',
        423
      );
    }

    if (usuario) {
      const match = await bcrypt.compare(password, usuario.password);
      if (match) {
        // Si la contraseña es correcta se resetea los intentos
        await this.usuarioService.updateAttemps(usuario.id, 0);
        // await this.usuarioStatusSerive.saveStatus(
        //   usuario.id,
        //   AUTH_USUARIO_STATUS_ESTADOS.ESTADO_LOGIN_CORRECTO,
        //   usuario.id,
        // );
        result = usuario;
      } else {
        //si la contraseña no es correcta se suma un intento mas
        await this.usuarioService.updateAttemps(
          usuario.id,
          usuario.attemps + 1,
        );
        // await this.usuarioStatusSerive.saveStatus(
        //   usuario.id,
        //   AUTH_USUARIO_STATUS_ESTADOS.ESTADO_ERROR_PASSWORD,
        //   usuario.id,
        // );
        throw new BadRequestException('Usuario o contraseña incorrectos');
      }
    }

    return result;
  }

  generateJWT(usuario: Usuario, secretJwt?: string, expiresInToken?: string) {
    let secret = this.authConst.jwtSecret
    if (secretJwt) {
      secret = secretJwt
    }
    let expiresIn = this.authConst.jwtExpired
    if (expiresInToken) {
      expiresIn = expiresInToken
    }
    const payload: PayloadToken = {
      uid: usuario.id,
      nombre: usuario.nombre,
      role: usuario.roleId
    };
    return this.jwtService.sign(payload, { expiresIn: expiresIn as any, secret });
  }


  generateRefreshJWT(usuario: Usuario) {
    return this.generateJWT(usuario, this.authConst.jwtRefreshSecret, this.authConst.jwtRefreshSecretExpired)
  }

  async updateRefreshToken(id: number, refreshToken: string | null): Promise<Usuario> {
    let result: Usuario
    const usuario = await this.usuarioService.findOne(id);
    if (usuario) {
      result = await this.usuarioService.update(id, { refreshToken })
    } else {
      result = null;
    }
    return result
  }

  getConfigNameCookie() {
    return this.authConst.cookieSessionTokenName
  }

  getConfigCookie(): CookieSerializeOptions {
    return {
      domain: this.authConst.cookieDomain,
      httpOnly: true,
      sameSite: 'lax',
      maxAge: Number.parseInt(this.authConst.cookieExpired),
      secure: this.authConst.cookieSecure === 'true',
    };
  }

  getConfigCookieLogout(): CookieSerializeOptions {
    const config = this.getConfigCookie()
    return {
      ...config,
      expires: new Date(0),
    };
  }

  hasPermission(path: string, role: number) {
    // const routes = this.getRoutes(role)
    // const pathFormated = this.replaceNumbersWithId(path);
    // let hasPermission = false
    // try {
    //   routes.forEach(route => {
    //     if (route === pathFormated) {
    //       hasPermission = true
    //     }
    //   })
    // } catch (err) {
    //   console.error('Error checking permission:', err);
    // }
    // return hasPermission
  }

  getRoutes(role: number) {
    // const routesRole = PERMISSIONS.find(e => e.roleId === role)?.routes ?? []
    // const routes = []
    // routesRole.forEach(e => {
    //   const routesItems = ROUTES[e.name]
    //   for (const key in e.permission) {
    //     if (Object.prototype.hasOwnProperty.call(e.permission, key)) {
    //       const value = e.permission[key];
    //       if (routesItems[key] && value) {
    //         routes.push(this.normalizePathTemplate(routesItems[key]))
    //       }
    //     }
    //   }
    // })
    // return routes
  }

  replaceNumbersWithId(path) {
    // Reemplaza segmentos numéricos en el path con :id
    return path.replace(/\/\d+/g, '/:id');
  }

  normalizePathTemplate(path: string) {
    // Reemplaza cualquier segmento del tipo :palabra con :id
    return path.replace(/:[a-zA-Z0-9_]+/g, ':id');
  }

  getMenu(role: number) {
    return MENU
  }

  filterMenuByPermissions(menu: any[], permissions: any[]): any[] {
    const permissionIds = new Set(permissions.map(p => p?.codigo));

    return menu
      .filter(item => {
        // Si el item tiene un id de permiso, verificar si el usuario lo tiene
        if (item.id && !permissionIds.has(item.id)) {
          return false;
        }
        return true;
      })
      .map(item => {
        const filteredItem: any = {
          id: item.id,
          title: item.title,
          url: item.url,
        };

        // Incluir icon si existe
        if (item.icon) {
          filteredItem.icon = item.icon;
        }

        // Si tiene subitems, filtrarlos recursivamente
        if (item.items && item.items.length > 0) {
          const filteredItems = this.filterMenuByPermissions(item.items, permissions);
          if (filteredItems.length > 0) {
            filteredItem.items = filteredItems;
          } else {
            // Era una categoría con hijos pero ninguno es visible: ocultar
            return null;
          }
        }

        return filteredItem;
      })
      .filter(item => item !== null);
  }
}
