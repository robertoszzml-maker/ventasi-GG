import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserAvatarService } from './user-avatar.service';
import { UserAvatarController } from './user-avatar.controller';
import { UserAvatar } from './entities/user-avatar.entity';
import { ArchivoModule } from '@/modules/archivo/archivo.module';
import { UsuarioModule } from '@/modules/auth/usuario/usuario.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserAvatar]),
    ArchivoModule,
    UsuarioModule,
  ],
  controllers: [UserAvatarController],
  providers: [UserAvatarService],
  exports: [UserAvatarService],
})
export class UserAvatarModule {}
