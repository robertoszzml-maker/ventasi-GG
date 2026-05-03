import * as LucideIcons from "lucide-react";
import { LucideProps } from "lucide-react";

interface DynamicIconProps extends LucideProps {
  name?: string;
  fallback?: keyof typeof LucideIcons;
}

/**
 * Componente para renderizar iconos de Lucide dinámicamente por nombre
 * @param name - Nombre del icono de Lucide (ej: "Phone", "Mail", "Calendar")
 * @param fallback - Icono por defecto si no se encuentra el nombre (default: "User")
 * @param ...props - Props adicionales de Lucide (className, size, color, etc.)
 */
export function DynamicIcon({
  name,
  fallback = "User",
  ...props
}: DynamicIconProps) {
  // Si no hay nombre, usar el fallback
  if (!name) {
    const FallbackIcon = LucideIcons[fallback] as React.ComponentType<LucideProps>;
    return <FallbackIcon {...props} />;
  }

  // Buscar el icono dinámicamente
  const Icon = (
    LucideIcons as unknown as Record<string, React.ComponentType<LucideProps>>
  )[name];

  // Verificar si es un componente válido
  if (Icon && (typeof Icon === "function" || typeof Icon === "object")) {
    return <Icon {...props} />;
  }

  // Si no se encuentra, usar el fallback
  const FallbackIcon = LucideIcons[fallback] as React.ComponentType<LucideProps>;
  return <FallbackIcon {...props} />;
}
