"use client";

import { Menu, User } from "@/types";
import * as React from "react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import { RoleDisplay } from "@/components/role-display";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";

type TypeSidebar = React.ComponentProps<typeof Sidebar>;
type AppSidebar = TypeSidebar & {
  user?: User;
  menu?: Menu;
};

export function AppSidebar({ ...props }: AppSidebar) {
  const { menu, user } = props;

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        {user && (
          <RoleDisplay
            roleName={user.roleName}
            roleColor={user.roleColor}
            roleIcon={user.roleIcon}
          />
        )}
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={menu} />
        {/* <NavProjects projects={data.projects} /> */}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
