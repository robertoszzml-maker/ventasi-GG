"use client";
import * as React from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  FormControl,
  FormItem,
  FormLabel,
  FormField,
  FormMessage,
} from "@/components/ui/form";

export const COLORES_PREDEFINIDOS = [
  { nombre: "Rojo", valor: "#ef4444" },
  { nombre: "Naranja", valor: "#f97316" },
  { nombre: "Amarillo", valor: "#eab308" },
  { nombre: "Verde", valor: "#22c55e" },
  { nombre: "Turquesa", valor: "#14b8a6" },
  { nombre: "Azul", valor: "#3b82f6" },
  { nombre: "Índigo", valor: "#6366f1" },
  { nombre: "Púrpura", valor: "#a855f7" },
  { nombre: "Rosa", valor: "#ec4899" },
  { nombre: "Gris", valor: "#6b7280" },
];

// Componente standalone para usar sin react-hook-form
interface ColorPickerStandaloneProps {
  value: string | null;
  onChange: (color: string | null) => void;
  disabled?: boolean;
  defaultColor?: string;
}

export function ColorPickerStandalone({
  value,
  onChange,
  disabled = false,
  defaultColor = "#3b82f6",
}: ColorPickerStandaloneProps) {
  return (
    <div className="space-y-4">
      {/* Colores predefinidos */}
      <div className="grid grid-cols-5 gap-3">
        {COLORES_PREDEFINIDOS.map((color) => (
          <button
            key={color.valor}
            type="button"
            onClick={() => onChange(color.valor)}
            className={cn(
              "w-10 h-10 rounded-full transition-all hover:scale-110",
              value === color.valor && "ring-2 ring-offset-2 ring-primary"
            )}
            style={{ backgroundColor: color.valor }}
            title={color.nombre}
            disabled={disabled}
          />
        ))}
      </div>

      {/* Color picker personalizado */}
      <div className="pt-4 border-t">
        <p className="text-sm text-muted-foreground mb-2">
          Color personalizado:
        </p>
        <input
          type="color"
          value={value || defaultColor}
          onChange={(e) => onChange(e.target.value)}
          className="w-full h-10 cursor-pointer rounded"
          disabled={disabled}
        />
      </div>
    </div>
  );
}

interface ColorPickerProps {
  form: any;
  name: string;
  label: string;
  onChange?: (color: string) => void;
  disabled?: boolean;
  className?: string;
  defaultColor?: string;
}

export function ColorPicker({
  form,
  name,
  label,
  onChange,
  disabled = false,
  className,
  defaultColor = "#2563eb",
}: ColorPickerProps) {
  const [colorPickerOpen, setColorPickerOpen] = React.useState(false);

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    form.setValue(name, newColor);
    if (onChange) onChange(newColor);
  };

  const handlePresetColorClick = (color: string) => {
    form.setValue(name, color);
    if (onChange) onChange(color);
    setColorPickerOpen(false);
  };

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem className={cn("flex flex-col mt-2", className)}>
          <FormLabel>{label}</FormLabel>
          <Popover open={colorPickerOpen} onOpenChange={setColorPickerOpen}>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  type="button"
                  variant="outline"
                  className={cn(
                    "w-full justify-between h-10",
                    fieldState.error && "border-red-500"
                  )}
                  disabled={disabled}
                >
                  <span className="flex items-center gap-2">
                    {field.value ? (
                      <>
                        <span
                          className="w-4 h-4 rounded-full border"
                          style={{ backgroundColor: field.value }}
                        />
                        <span className="text-xs">{field.value}</span>
                      </>
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        Seleccionar color
                      </span>
                    )}
                  </span>
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-56">
              {/* Colores predefinidos */}
              <div className="grid grid-cols-5 gap-2 mb-3">
                {COLORES_PREDEFINIDOS.map((color) => (
                  <button
                    key={color.valor}
                    type="button"
                    onClick={() => handlePresetColorClick(color.valor)}
                    className={cn(
                      "w-8 h-8 rounded-full transition-all hover:scale-110",
                      field.value === color.valor &&
                        "ring-2 ring-offset-2 ring-primary"
                    )}
                    style={{ backgroundColor: color.valor }}
                    title={color.nombre}
                    disabled={disabled}
                  />
                ))}
              </div>

              {/* Separador */}
              <div className="border-t pt-3 mb-3">
                <p className="text-xs text-muted-foreground mb-2">
                  Color personalizado:
                </p>
                <input
                  type="color"
                  value={field.value || defaultColor}
                  onChange={handleColorChange}
                  className="w-full h-8 cursor-pointer rounded"
                  disabled={disabled}
                />
              </div>
            </PopoverContent>
          </Popover>
          {fieldState.error && (
            <FormMessage>{fieldState.error.message}</FormMessage>
          )}
        </FormItem>
      )}
    />
  );
}
