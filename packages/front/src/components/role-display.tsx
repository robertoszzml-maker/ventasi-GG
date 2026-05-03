"use client";

import * as React from "react";
import * as Icons from "lucide-react";
import { Shield } from "lucide-react";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

interface RoleDisplayProps {
  roleName?: string;
  roleColor?: string;
  roleIcon?: string;
}

export function RoleDisplay({
  roleName,
  roleColor,
  roleIcon,
}: RoleDisplayProps) {
  // Obtener el icono del rol
  const RoleIcon = roleIcon
    ? (Icons[roleIcon as keyof typeof Icons] ?? Shield)
    : Shield;

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size="lg"
          style={{
            backgroundColor: roleColor ? `${roleColor}20` : undefined,
          }}
        >
          <div
            className="flex aspect-square size-8 items-center justify-center rounded-lg"
            style={{
              backgroundColor: roleColor || "#64748b",
              color: "#ffffff",
            }}
          >
            <RoleIcon className="size-4" />
          </div>
          <div className="flex flex-col gap-0.5 leading-none">
            <span className="font-semibold">{roleName || "Sin Rol"}</span>
            <span className="text-xs text-muted-foreground">Rol actual</span>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
