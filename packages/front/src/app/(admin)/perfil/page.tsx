'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { PageTitle } from '@/components/ui/page-title';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useStore } from '@/lib/store';
import { UserAvatar, getUserAvatars, uploadAvatar, setPrincipalAvatar, deleteAvatar } from '@/services/user-avatar';
import { toast } from '@/hooks/use-toast';
import { Camera, Trash2, Star, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

function getInitials(nombre?: string): string {
  if (!nombre) return '??';
  const parts = nombre.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function PerfilPage() {
  const { user } = useStore();
  const [avatars, setAvatars] = useState<UserAvatar[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const loadAvatars = useCallback(async () => {
    try {
      const data = await getUserAvatars();
      setAvatars(data);
    } catch (error) {
      console.error('Error loading avatars:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los avatares',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAvatars();
  }, [loadAvatars]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Error',
        description: 'Solo se permiten archivos de imagen',
        variant: 'destructive',
      });
      return;
    }

    // Validar tamaño (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'Error',
        description: 'El archivo no puede superar los 5MB',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);
    try {
      await uploadAvatar(file, file.name);
      toast({
        title: 'Éxito',
        description: 'Avatar subido correctamente',
      });
      await loadAvatars();
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        title: 'Error',
        description: 'No se pudo subir el avatar',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSetPrincipal = async (avatarId: number) => {
    try {
      await setPrincipalAvatar(avatarId);
      toast({
        title: 'Éxito',
        description: 'Avatar principal actualizado',
      });
      await loadAvatars();
    } catch (error) {
      console.error('Error setting principal avatar:', error);
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el avatar principal',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteAvatar = async (avatarId: number) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este avatar?')) {
      return;
    }

    try {
      await deleteAvatar(avatarId);
      toast({
        title: 'Éxito',
        description: 'Avatar eliminado correctamente',
      });
      await loadAvatars();
    } catch (error) {
      console.error('Error deleting avatar:', error);
      toast({
        title: 'Error',
        description: 'No se pudo eliminar el avatar',
        variant: 'destructive',
      });
    }
  };

  const getAvatarUrl = (avatar: UserAvatar): string => {
    if (avatar.archivo?.url) {
      return `${process.env.NEXT_PUBLIC_API_URL?.replace('/v1/', '')}/${avatar.archivo.url}`;
    }
    return '';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin h-8 w-8" />
      </div>
    );
  }

  return (
    <>
      <PageTitle title="Mi Perfil" />

      <div className="grid gap-6">
        {/* Información del usuario */}
        <Card>
          <CardHeader>
            <CardTitle>Información Personal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                {avatars.find(a => a.esPrincipal) ? (
                  <AvatarImage 
                    src={getAvatarUrl(avatars.find(a => a.esPrincipal)!)} 
                    alt={user?.nombre} 
                  />
                ) : null}
                <AvatarFallback className="text-2xl">{getInitials(user?.nombre)}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-lg font-semibold">{user?.nombre}</h3>
                <p className="text-muted-foreground">{user?.email}</p>
                <p className="text-sm text-muted-foreground capitalize">{user?.roleName}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Gestión de avatares */}
        <Card>
          <CardHeader>
            <CardTitle>Mis Fotos de Perfil</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Puedes subir hasta 3 fotos de perfil. Haz clic en la estrella para establecer una foto como principal.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {/* Avatar actual */}
              {avatars.map((avatar) => (
                <div
                  key={avatar.id}
                  className={cn(
                    "relative group rounded-xl overflow-hidden border-2 transition-all",
                    avatar.esPrincipal ? "border-primary ring-2 ring-primary" : "border-border hover:border-primary/50"
                  )}
                >
                  <div className="aspect-square relative">
                    <img
                      src={getAvatarUrl(avatar)}
                      alt={avatar.nombre}
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Overlay con acciones */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      {!avatar.esPrincipal && (
                        <Button
                          variant="secondary"
                          size="icon"
                          onClick={() => handleSetPrincipal(avatar.id)}
                          title="Establecer como principal"
                        >
                          <Star className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => handleDeleteAvatar(avatar.id)}
                        title="Eliminar"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Badge de principal */}
                  {avatar.esPrincipal && (
                    <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full font-medium">
                      Principal
                    </div>
                  )}
                </div>
              ))}

              {/* Botón para agregar nuevo avatar */}
              {avatars.length < 3 && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="aspect-square rounded-xl border-2 border-dashed border-border hover:border-primary/50 hover:bg-primary/5 transition-all flex flex-col items-center justify-center gap-2"
                >
                  {uploading ? (
                    <Loader2 className="animate-spin h-8 w-8 text-muted-foreground" />
                  ) : (
                    <>
                      <Camera className="h-8 w-8 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Agregar foto</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Input oculto para selección de archivo */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
