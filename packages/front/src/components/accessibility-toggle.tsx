import React from "react";
import { Switch } from "@/components/ui/switch";
import { Accessibility } from "lucide-react";
import { useConfigStore } from "@/stores/config-store"; // Asegúrate de importar el store correctamente

export function AccessibilityToggle() {
    const { accessibilityMode, toggleAccessibilityMode } = useConfigStore(); // Obtiene el estado y la función del store

    return (
        <div className="flex items-center justify-between w-full">
            <Accessibility />
            <Switch checked={accessibilityMode} onCheckedChange={toggleAccessibilityMode} />
        </div>
    );
}