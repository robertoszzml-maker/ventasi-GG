import {
  Controller,
  Get,
  Post,
  Delete,
  Put,
  Param,
  Body,
  UploadedFile,
  UseInterceptors,
  ParseIntPipe,
  Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nest-lab/fastify-multer';
import { UserAvatarService } from './user-avatar.service';
import { UserAvatar } from './entities/user-avatar.entity';
import { RequirePermissions } from '@/modules/auth/decorators/require-permissions/require-permissions.decorator';
import { PERMISOS } from '@/constants/permisos';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth/jwt-auth.guard';
import { ApiKeyGuard } from '@/modules/auth/guards/api-key/api-key.guard';
import { AuthorizationGuard } from '@/modules/auth/guards/authorization/authorization.guard';
import { PayloadTokenWithRefreshToken } from '@/interfaces/auth';

interface RequestWithUser extends Request {
  user: PayloadTokenWithRefreshToken;
}

@Controller('user-avatars')
@UseGuards(JwtAuthGuard, ApiKeyGuard, AuthorizationGuard)
export class UserAvatarController {
  constructor(private readonly userAvatarService: UserAvatarService) { }

  @Get()
  @RequirePermissions(PERMISOS.USUARIOS_VER)
  async getMyAvatars(@Req() req: RequestWithUser): Promise<UserAvatar[]> {
    const { uid } = req.user;
    return this.userAvatarService.getUserAvatars(uid);
  }

  @Get('principal')
  @RequirePermissions(PERMISOS.USUARIOS_VER)
  async getPrincipalAvatar(@Req() req: RequestWithUser): Promise<UserAvatar | null> {
    const { uid } = req.user;
    return this.userAvatarService.getPrincipalAvatar(uid);
  }

  @Post()
  @RequirePermissions(PERMISOS.USUARIOS_EDITAR)
  @UseInterceptors(FileInterceptor('file'))
  async uploadAvatar(
    @Req() req: RequestWithUser,
    @UploadedFile() file: any,
    @Body('nombre') nombre?: string,
  ): Promise<UserAvatar> {
    const { uid } = req.user;
    if (!file) {
      throw new Error('No se proporcionó ningún archivo');
    }
    return this.userAvatarService.uploadAvatar(uid, file, nombre);
  }

  @Put(':id/principal')
  @RequirePermissions(PERMISOS.USUARIOS_EDITAR)
  async setPrincipalAvatar(
    @Req() req: RequestWithUser,
    @Param('id', ParseIntPipe) avatarId: number,
  ): Promise<UserAvatar> {
    const { uid } = req.user;
    return this.userAvatarService.setPrincipalAvatar(uid, avatarId);
  }

  @Delete(':id')
  @RequirePermissions(PERMISOS.USUARIOS_EDITAR)
  async deleteAvatar(
    @Req() req: RequestWithUser,
    @Param('id', ParseIntPipe) avatarId: number,
  ): Promise<{ message: string }> {
    const { uid } = req.user;
    await this.userAvatarService.deleteAvatar(uid, avatarId);
    return { message: 'Avatar eliminado correctamente' };
  }

  @Put('reorder')
  @RequirePermissions(PERMISOS.USUARIOS_EDITAR)
  async reorderAvatars(
    @Req() req: RequestWithUser,
    @Body('avatarIds') avatarIds: number[],
  ): Promise<UserAvatar[]> {
    const { uid } = req.user;
    return this.userAvatarService.reorderAvatars(uid, avatarIds);
  }
}
