'use client';

import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { useToast } from "@/hooks/use-toast";
import { formSchema } from "@/lib/schema-login";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { Camera, Loader2, Upload, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Toaster } from "./ui/toaster";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { toast } = useToast();
  const [isLoading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [avatarImage, setAvatarImage] = useState<string | null>(null);
  const [isAvatarLoading, setIsAvatarLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Efecto de montaje y carga de avatar
  useEffect(() => {
    // Pequeño delay para que las transiciones CSS funcionen correctamente
    const timer = setTimeout(() => {
      setMounted(true);
    }, 50);
    
    // Cargar avatar guardado
    const savedAvatar = localStorage.getItem('login-avatar-image');
    if (savedAvatar) {
      setAvatarImage(savedAvatar);
    }
    
    return () => clearTimeout(timer);
  }, []);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Error",
        description: "Por favor selecciona una imagen válida",
        variant: "destructive",
      });
      return;
    }

    setIsAvatarLoading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setAvatarImage(result);
      localStorage.setItem('login-avatar-image', result);
      setIsAvatarLoading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = (e: React.MouseEvent) => {
    e.stopPropagation();
    setAvatarImage(null);
    localStorage.removeItem('login-avatar-image');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3001/v1/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'app': 'nombre_app',
        },
        body: JSON.stringify(values),
      });

      const result = await response.json();

      // Verificar si la respuesta HTTP fue exitosa
      if (!response.ok) {
        toast({
          title: "Error",
          description: result.message || `Error ${response.status}: ${response.statusText}`,
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      if (result?.success && result?.data?.authToken) {
        sessionStorage.setItem("tokenAuth", result?.data?.authToken);
        localStorage.setItem("session-token", result?.data?.sessionToken);
        window.location.href = '/';
      } else {
        toast({
          title: "Error",
          description: result.message || 'Error de autenticación',
        });
      }
    } catch (error: any) {
      if (error?.status === 400) {
        toast({
          title: "Credenciales inválidas",
          description: "Revisá tu usuario y contraseña e intentá nuevamente.",
        });
      } else if (error?.status === 423) {
        toast({
          title: "⚠️ Usuario bloqueado",
          description:
            "Superaste el número de intentos permitidos, o el usuario esta inactivo.  Contactá al administrador.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Error de conexión con el servidor",
        });
      }

      console.error("Ocurrio un error", error);
    }
    setLoading(false);
  }

  return (
    <div className={cn("min-h-screen flex items-center justify-center relative overflow-hidden", className)} {...props}>
      {/* Fondo del Caribe con efecto de desenfoque */}
      <div 
        className={`
          absolute inset-0 bg-cover bg-center bg-no-repeat
          transition-all ease-out
          ${mounted ? 'blur-0 scale-100' : 'blur-[20px] scale-105'}
        `}
        style={{
          backgroundImage: 'url("/fondo-caribe.png")',
          transitionDuration: '2500ms',
        }}
      />
      
      {/* Overlay oscuro para mejorar legibilidad */}
      <div className="absolute inset-0 bg-black/30" />

      {/* Contenido principal */}
      <div 
        className={`
          relative z-10 w-full max-w-4xl mx-4
          transition-all ease-out
          ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
        `}
        style={{
          transitionDuration: '1500ms',
        }}
      >
        {/* Card con efecto cristal y borde animado celeste */}
        <div className="relative overflow-hidden rounded-xl shadow-2xl" style={{ backgroundColor: 'rgba(255, 255, 255, 0.30)' }}>
          {/* Borde animado que recorre el contorno */}
          <div 
            className="absolute inset-0 rounded-xl pointer-events-none"
            style={{
              background: 'linear-gradient(90deg, transparent, transparent, #00aeef, transparent, transparent)',
              backgroundSize: '200% 100%',
              animation: 'borderMove 6s linear infinite',
              padding: '2px',
              WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
              WebkitMaskComposite: 'xor',
              maskComposite: 'exclude',
            }}
          />
          <CardContent className="grid p-0 md:grid-cols-2 relative z-10">
            {/* Formulario de login */}
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 md:p-8">
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col items-center text-center">
                    <h1 className="text-2xl font-bold" style={{ color: 'white', textShadow: '0px 2px 8px rgba(0,0,0,0.8)' }}>
                      {process.env.NEXT_PUBLIC_APP_NAME || "VentaSi"}
                    </h1>
                    <p className="text-balance" style={{ color: 'white', textShadow: '0px 2px 4px rgba(0,0,0,0.6)' }}>
                      Ingrese sesión con su cuenta
                    </p>
                  </div>
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem className="grid gap-2">
                        <FormLabel htmlFor="email" style={{ color: 'white', textShadow: '0px 1px 3px rgba(0,0,0,0.6)' }}>Usuario</FormLabel>
                        <FormControl>
                          <Input
                            id="email"
                            placeholder="mi@mail.com"
                            type="email"
                            autoComplete="email"
                            className="placeholder:text-white/70"
                            style={{ backgroundColor: 'rgba(255, 255, 255, 0.25)', color: 'white', border: '1px solid rgba(255, 255, 255, 0.4)', textShadow: '0px 1px 3px rgba(0,0,0,0.8)' }}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem className="grid gap-2">
                        <div className="flex justify-between items-center">
                          <FormLabel htmlFor="password" style={{ color: 'white', textShadow: '0px 1px 3px rgba(0,0,0,0.6)' }}>Contraseña</FormLabel>
                          <Link
                            href="#"
                            className="ml-auto inline-block text-sm underline"
                            style={{ color: 'white', textShadow: '0px 1px 2px rgba(0,0,0,0.5)' }}
                          >
                            Olvidaste tu contraseña?
                          </Link>
                        </div>
                        <FormControl>
                          <PasswordInput
                            id="password"
                            placeholder="******"
                            autoComplete="current-password"
                            className="placeholder:text-white/70"
                            style={{ backgroundColor: 'rgba(255, 255, 255, 0.25)', color: 'white', border: '1px solid rgba(255, 255, 255, 0.4)', textShadow: '0px 1px 3px rgba(0,0,0,0.8)' }}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full font-semibold" disabled={isLoading} style={{ backgroundColor: '#00aeef', color: 'white' }}>
                    {isLoading && <Loader2 className="animate-spin mr-2" />}
                    Iniciar sesión
                  </Button>
                </div>
              </form>
            </Form>

            {/* Área de Avatar - Transparente para ver el fondo */}
            <div 
              className="relative hidden md:flex items-center justify-center p-6"
              style={{ backgroundColor: 'transparent' }}
            >
              {/* Input oculto para subir archivo */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />

              {/* Contenedor del avatar */}
              <div
                onClick={handleAvatarClick}
                className={`
                  relative w-48 h-48 rounded-2xl cursor-pointer
                  flex flex-col items-center justify-center
                  border-2 border-dashed border-white/50
                  transition-all duration-300 ease-out
                  hover:border-white hover:bg-white/10
                  ${avatarImage ? 'border-solid bg-white/20' : 'bg-white/5 backdrop-blur-sm'}
                `}
              >
                {isAvatarLoading ? (
                  <Loader2 className="w-8 h-8 text-white animate-spin" />
                ) : avatarImage ? (
                  <>
                    <Image
                      src={avatarImage}
                      alt="Avatar"
                      fill
                      className="object-cover rounded-2xl"
                    />
                    {/* Botón eliminar */}
                    <button
                      onClick={handleRemoveAvatar}
                      className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg z-10"
                      type="button"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    {/* Overlay editar */}
                    <div className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <div className="text-white text-center">
                        <Camera className="w-8 h-8 mx-auto mb-2" />
                        <span className="text-sm">Cambiar foto</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center text-white/90">
                    <Upload className="w-12 h-12 mx-auto mb-3 opacity-80" style={{ color: '#00aeef' }} />
                    <p className="text-sm font-medium mb-1">Agregar foto</p>
                    <p className="text-xs opacity-70">Empresa o perfil</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </div>

        {/* Footer con efecto de sombra */}
        <p className="text-center text-sm mt-6" style={{ color: 'white', textShadow: '0px 2px 8px rgba(0,0,0,0.8)', background: 'linear-gradient(135deg, rgba(0,0,0,0.3), rgba(0,0,0,0.1))', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)', borderRadius: '8px', padding: '8px 12px', border: '1px solid rgba(255,255,255,0.1)', fontWeight: 500 }}>
          Bienvenido al CRM de {process.env.NEXT_PUBLIC_APP_NAME || "VentaSi"}, la
          herramienta interna diseñada para gestionar y dar seguimiento a trabajos
          y presupuestos de manera eficiente.
        </p>
      </div>
      <Toaster />
      
      {/* Animación CSS para el borde */}
      <style jsx>{`
        @keyframes borderMove {
          0% {
            background-position: 0% 50%;
          }
          100% {
            background-position: 200% 50%;
          }
        }
      `}</style>
    </div>
  );
}
