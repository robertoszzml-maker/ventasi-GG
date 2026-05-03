"use client";

import { Settings, Trash2 } from "lucide-react";

import { AccessibilityToggle } from "@/components/accessibility-toggle";
import { ViewModeToggle } from "@/components/view-mode-toggle";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ConfigMenu() {
  const handleClearNavigation = () => {
    // Limpiar todo el localStorage
    localStorage.clear();
    // Recargar la página para aplicar los cambios
    window.location.reload();
  };

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Settings className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">Open configuration menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Configuración</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-default"
          onSelect={(e) => e.preventDefault()}
        >
          <ModeToggle />
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-default"
          onSelect={(e) => e.preventDefault()}
        >
          <ViewModeToggle />
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-default"
          onSelect={(e) => e.preventDefault()}
        >
          <AccessibilityToggle />
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleClearNavigation}
          className="text-red-600 focus:bg-red-50 focus:text-red-600"
        >
          <Trash2 className="h-4 w-4" />
          Limpiar datos
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
