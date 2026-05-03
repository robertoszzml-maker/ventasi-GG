import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserAvatar } from './entities/user-avatar.entity';
import { ArchivoService } from '@/modules/archivo/archivo.service';
import { UsuarioService } from '@/modules/auth/usuario/usuario.service';

@Injectable()
export class UserAvatarService {
  constructor(
    @InjectRepository(UserAvatar)
    private userAvatarRepository: Repository<UserAvatar>,
    private archivoService: ArchivoService,
    private usuarioService: UsuarioService,
  ) { }

  async getUserAvatars(usuarioId: number): Promise<UserAvatar[]> {
    return this.userAvatarRepository.find({
      where: { usuarioId },
      relations: ['archivo'],
      order: { esPrincipal: 'DESC', orden: 'ASC', createdAt: 'DESC' },
    });
  }

  async getPrincipalAvatar(usuarioId: number): Promise<UserAvatar | null> {
    return this.userAvatarRepository.findOne({
      where: { usuarioId, esPrincipal: true },
      relations: ['archivo'],
    });
  }

  async uploadAvatar(
    usuarioId: number,
    file: any,
    nombre?: string,
  ): Promise<UserAvatar> {
    // Crear registro de archivo
    const createArchivoDto = {
      nombre: nombre || file.originalname,
      nombreArchivo: file.filename,
      nombreArchivoOriginal: file.originalname,
      url: file.path,
      extension: file.mimetype,
      modelo: 'avatar',
      modeloId: usuarioId,
      tipo: file.mimetype,
    };
    const archivo = await this.archivoService.create(createArchivoDto, file);

    // Verificar si es el primer avatar (será principal)
    const existingAvatars = await this.getUserAvatars(usuarioId);
    const esPrincipal = existingAvatars.length === 0;

    // Crear registro de avatar
    const avatar = this.userAvatarRepository.create({
      usuarioId,
      archivoId: archivo.id,
      nombre: nombre || file.originalname,
      esPrincipal,
      orden: existingAvatars.length,
    });

    const savedAvatar = await this.userAvatarRepository.save(avatar);

    // Si es el principal, actualizar el usuario
    if (esPrincipal) {
      await this.usuarioService.update(usuarioId, { avatarId: savedAvatar.id } as any);
    }

    return this.userAvatarRepository.findOne({
      where: { id: savedAvatar.id },
      relations: ['archivo'],
    });
  }

  async setPrincipalAvatar(usuarioId: number, avatarId: number): Promise<UserAvatar> {
    const avatar = await this.userAvatarRepository.findOne({
      where: { id: avatarId, usuarioId },
    });

    if (!avatar) {
      throw new NotFoundException('Avatar no encontrado');
    }

    // Quitar principal de otros avatares
    await this.userAvatarRepository.update(
      { usuarioId, esPrincipal: true },
      { esPrincipal: false },
    );

    // Establecer este como principal
    avatar.esPrincipal = true;
    await this.userAvatarRepository.save(avatar);

    // Actualizar usuario
    await this.usuarioService.update(usuarioId, { avatarId: avatar.id } as any);

    return this.userAvatarRepository.findOne({
      where: { id: avatarId },
      relations: ['archivo'],
    });
  }

  async deleteAvatar(usuarioId: number, avatarId: number): Promise<void> {
    const avatar = await this.userAvatarRepository.findOne({
      where: { id: avatarId, usuarioId },
      relations: ['archivo'],
    });

    if (!avatar) {
      throw new NotFoundException('Avatar no encontrado');
    }

    const wasPrincipal = avatar.esPrincipal;

    // Eliminar archivo físico
    await this.archivoService.remove(avatar.archivoId);

    // Eliminar registro
    await this.userAvatarRepository.remove(avatar);

    // Si era el principal, establecer otro como principal
    if (wasPrincipal) {
      const remaining = await this.getUserAvatars(usuarioId);
      if (remaining.length > 0) {
        await this.setPrincipalAvatar(usuarioId, remaining[0].id);
      } else {
        // No quedan avatares, limpiar avatar_id del usuario
        await this.usuarioService.update(usuarioId, { avatarId: null } as any);
      }
    }
  }

  async reorderAvatars(usuarioId: number, avatarIds: number[]): Promise<UserAvatar[]> {
    for (let i = 0; i < avatarIds.length; i++) {
      await this.userAvatarRepository.update(
        { id: avatarIds[i], usuarioId },
        { orden: i },
      );
    }

    return this.getUserAvatars(usuarioId);
  }
}
