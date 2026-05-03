import { PayloadTokenWithRefreshToken } from '@/interfaces/auth';
import { Body, Controller, Get, NotFoundException, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBody, ApiOperation } from '@nestjs/swagger';
import { FastifyReply, FastifyRequest } from 'fastify';
import { AuthService } from './auth.service';
import { Public } from './decorators/public/public.decorator';
import { LoginDto } from './dto/login.dto';
import { ApiKeyGuard } from './guards/api-key/api-key.guard';
import { JwtAuthGuard } from './guards/jwt-auth/jwt-auth.guard';
import { JwtRefreshGuard } from './guards/jwt-refresh/jwt-refresh.guard';
import { Usuario } from './usuario/entities/usuario.entity';
import { PermissionsService } from './permissions/permissions.service';
interface FastifyRequestWithUser extends FastifyRequest {
  user: Usuario
}

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly permissionService: PermissionsService,
  ) { }

  @UseGuards(AuthGuard('local'), ApiKeyGuard)
  @ApiBody({ type: LoginDto })
  @ApiOperation({ summary: 'Loguea al usuario.' })
  @Post('login')
  async login(@Req() req: FastifyRequestWithUser, @Res() res: FastifyReply) {
    const usuario = req.user as Usuario
    const token = this.authService.generateJWT(usuario);
    const sessionToken = this.authService.generateRefreshJWT(usuario);
    await this.authService.updateRefreshToken(usuario.id, sessionToken);
    res.send({
      success: true,
      message: 'Sesion iniciada con éxito',
      data: { authToken: token, sessionToken },
    });
  }

  @UseGuards(JwtRefreshGuard)
  @Get('refresh')
  async refreshTokens(@Req() req: FastifyRequestWithUser, @Res() res: FastifyReply) {
    const { uid: id } = req.user as unknown as PayloadTokenWithRefreshToken;
    const usuario = await this.authService.findUsuarioById(id)
    if (!usuario) {
      return res.status(404).send({ message: 'Usuario inexistente' });
    }
    const token = this.authService.generateJWT(usuario);
    const sessionToken = this.authService.generateRefreshJWT(usuario);
    await this.authService.updateRefreshToken(usuario.id, sessionToken);
    return res.send({
      success: true,
      message: 'Token actualizado con éxito',
      data: { authToken: token, sessionToken },
    });
  }

  @Public()
  @Post('logout')
  logout(@Res() res: FastifyReply) {
    res.status(200).send({ success: true, message: 'Su sesión ha finalizado con éxito' });
  }

  @ApiOperation({
    summary: 'Retorna la información del usuario que realiza la petición.',
  })
  @UseGuards(JwtAuthGuard, ApiKeyGuard)
  @Get('profile')
  async profile(@Req() req: FastifyRequestWithUser, @Res() res: FastifyReply) {
    const { uid: id, } = req.user as unknown as PayloadTokenWithRefreshToken;
    const usuario = await this.authService.findUsuarioById(id)

    if (!usuario) {
      throw new NotFoundException('Error al obtener perfil.');
    }
    const menu = this.authService.getMenu(usuario.roleId)
    res.send({
      success: true,
      data: {
        user: {
          nombre: usuario.nombre,
          email: usuario.email,
        },
        menu,
        team: [{
          name: process.env.APP_NAME,
          logo: 'GalleryVerticalEnd',
          plan: usuario.role,
        }],
      }
    });
  }

  @UseGuards(JwtAuthGuard)
  @Post('check-session')
  async checkSession(@Req() req: FastifyRequestWithUser, @Res() res: FastifyReply, @Body() body: { path: string }) {
    const { uid: id } = req.user as unknown as PayloadTokenWithRefreshToken;
    const usuario = await this.authService.findUsuarioById(id)
    if (!usuario) {
      return res.status(404).send({ success: false, message: 'Usuario inexistente' });
    }
    const { path } = body
    // Usar roleId en lugar de permisoId (fallback a permisoId por compatibilidad)
    const roleId = usuario.roleId || usuario.roleId
    const hasPermission = this.authService.hasPermission(path, roleId)
    const fullMenu = this.authService.getMenu(roleId)

    const permissions = await this.permissionService.getRolePermissions(roleId)

    // Filtrar el menú basándose en los permisos del usuario
    const menu = this.authService.filterMenuByPermissions(fullMenu, permissions)

    // Obtener URL del avatar principal si existe
    const avatarUrl = usuario.avatar?.archivo?.url || null;

    res.send({
      success: true,
      hasPermission,
      user: {
        userId: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        roleId: roleId,
        roleName: usuario.role?.nombre || usuario.role?.nombre,
        roleColor: usuario.role?.color || usuario.role?.color,
        roleIcon: usuario.role?.icono || usuario.role?.icono,
        avatarUrl: avatarUrl,
      },
      menu,
      permissions
    })
  }
}
