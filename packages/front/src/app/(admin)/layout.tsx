"use client";
import { AppSidebar } from "@/components/app-sidebar";
import Navbar from "@/components/navbar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import fetchClient from "@/lib/api-client";
import { useStore } from "@/lib/store";
import { CheckAccess, Menu, User } from "@/types";
import { useRouter } from "next/navigation";
import React from "react";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isLoading, setLoading] = React.useState(true);
  const { setUser: setUserStore, setPermissions, setMenu: setMenuStore } = useStore();
  const [user, setUser] = React.useState<User>();
  const [menu, setMenu] = React.useState<Menu>();
  const router = useRouter();

  React.useEffect(() => {
    // Limpiar datos corruptos de avatares
    localStorage.removeItem('login-avatar-image');
    localStorage.removeItem('user-avatar');
    localStorage.removeItem('avatar-data');
    
    const checkAccess = async () => {
      const result = (await fetchClient("auth/check-session", "POST", {
        path: "/dashboard",
      })) as unknown as CheckAccess;
      setUser(result?.user ?? undefined);
      setUserStore(result?.user ?? undefined);
      setPermissions(result?.permissions ?? []);
      setMenu(result?.menu ?? undefined);
      setMenuStore(result?.menu ?? undefined);
      // if (!result?.hasPermission) {
      //   router.push("/");
      // }
      setLoading(false);
    };
    const sessionToken = localStorage.getItem("session-token");
    if (!sessionToken) {
      sessionStorage.setItem("authToken", "");
      window.location.href = "/login";
    }
    checkAccess();
  }, []);
  return (
    <div className="flex h-screen overflow-hidden">
      <SidebarProvider>
        {!isLoading && <AppSidebar user={user} menu={menu} />}
        <SidebarInset className="flex-1 flex flex-col overflow-hidden">
          <Navbar />
          <main className="flex-1 p-6 overflow-auto">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
