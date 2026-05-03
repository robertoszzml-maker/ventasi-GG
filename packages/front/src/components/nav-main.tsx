"use client";

import { ChevronRight } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { DynamicIcon } from "@/components/ui/icon";
import { Menu } from "@/types";

export function NavMain({ items }: { items?: Menu }) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Sistema</SidebarGroupLabel>
      <SidebarMenu>
        {items?.map((item, i) => (
          <SidebarMenuItem key={i}>
            {/* Si el item tiene subitems, lo volvemos colapsable */}
            {item.items?.length ? (
              <Collapsible
                defaultOpen={item.isActive}
                asChild
                className="group/collapsible"
              >
                <div>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton tooltip={item.title}>
                      {item.icon && <DynamicIcon name={item.icon} />}
                      <span>{item.title}</span>
                      <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items.map((subItem, k) => (
                        <SidebarMenuSubItem key={"submenu" + k}>
                          <SidebarMenuSubButton asChild>
                            <a href={subItem.url}>
                              <span>{subItem.title}</span>
                            </a>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </div>
              </Collapsible>
            ) : (
              <a href={item.url}>
                <SidebarMenuButton tooltip={item.title}>
                  {item.icon && <DynamicIcon name={item.icon} />}
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </a>
            )}
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}

// TODO: En lugar de usar a se puede usar Link para no ir al servidor por cada pagina, esto queda pendiente verlo con wachu
