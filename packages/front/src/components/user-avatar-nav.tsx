"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { UserAvatar, getUserAvatars, getPrincipalAvatar } from "@/services/user-avatar";
import { User, LogOut, Settings, Camera } from "lucide-react";
import { toast } from "@/hooks/use-toast";

function getInitials(nombre?: string): string {
  if (!nombre) return "??";
  const parts = nombre.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function UserAvatarNav() {
  const router = useRouter();
  const { user, setUser } = useStore();
  const [principalAvatar, setPrincipalAvatar] = useState<UserAvatar | null>(null);
  const [loading, setLoading] = useState(true);

  const loadAvatar = useCallback(async () => {
    try {
      const avatar = await getPrincipalAvatar();
      setPrincipalAvatar(avatar);
    } catch (error) {
      console.error("Error loading avatar:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAvatar();
  }, [loadAvatar]);

  const getAvatarUrl = (avatar: UserAvatar | null): string => {
    if (avatar?.archivo?.url) {
      return `${process.env.NEXT_PUBLIC_API_URL?.replace("/v1/", "")}/${avatar.archivo.url}`;
    }
    return "";
  };

  const logout = () => {
    setUser(undefined);
    sessionStorage.setItem("tokenAuth", "");
    localStorage.setItem("session-token", "");
    window.location.href = "/login";
  };

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-12 w-12 rounded-full p-0 hover:bg-transparent group"
        >
          {/* Marco decorativo con gradiente */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary via-purple-500 to-pink-500 p-[2px] group-hover:scale-105 transition-transform duration-300">
            <div className="h-full w-full rounded-full bg-background p-[2px]">
              <Avatar className="h-full w-full ring-0">
                <AvatarImage
                  src={getAvatarUrl(principalAvatar)}
                  alt={user?.nombre}
                  className="object-cover"
                />
                <AvatarFallback className="bg-gradient-to-br from-primary/20 to-purple-500/20 text-primary font-semibold">
                  {getInitials(user?.nombre)}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
          
          {/* Badge de estado online */}
          <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-background" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-64">
        {/* Header con info del usuario */}
        <DropdownMenuLabel className="p-0">
          <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-primary/10 via-purple-500/5 to-transparent rounded-t-lg">
            <div className="relative">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary via-purple-500 to-pink-500 p-[2px]">
                <div className="h-full w-full rounded-full bg-background p-[2px]">
                  <Avatar className="h-full w-full">
                    <AvatarImage
                      src={getAvatarUrl(principalAvatar)}
                      alt={user?.nombre}
                    />
                    <AvatarFallback className="bg-gradient-to-br from-primary/20 to-purple-500/20 text-primary text-sm font-semibold">
                      {getInitials(user?.nombre)}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-green-500 border-2 border-background" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{user?.nombre}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary mt-1">
                {user?.roleName}
              </span>
            </div>
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator />
        
        {/* Opciones del menú */}
        <DropdownMenuItem
          onClick={() => router.push("/perfil")}
          className="gap-2 cursor-pointer"
        >
          <Camera className="h-4 w-4 text-muted-foreground" />
          <span>Cambiar foto de perfil</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem
          onClick={() => router.push("/perfil")}
          className="gap-2 cursor-pointer"
        >
          <Settings className="h-4 w-4 text-muted-foreground" />
          <span>Configuración</span>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem
          onClick={logout}
          className="gap-2 cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
        >
          <LogOut className="h-4 w-4" />
          <span>Cerrar sesión</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
