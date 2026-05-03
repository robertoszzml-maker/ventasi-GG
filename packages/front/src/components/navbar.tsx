"use client"

import { SidebarTrigger } from "@/components/ui/sidebar"
import { ArrowLeft, RefreshCwIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { ConfigMenu } from "./config-menu"
import Notificaciones from "./notificacion/notificacion"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export default function Navbar() {
  const router = useRouter()

  return (
    <nav className="sticky top-0 z-10 flex border-b justify-between px-4 py-2 items-center bg-background/95 backdrop-blur-sm supports-[backdrop-filter]:bg-background/80 shadow-sm">
      {/* Left section with menu trigger and back button */}
      <div className="flex items-center gap-1.5">
        <SidebarTrigger />
        <Button
          variant="outline"
          size="icon"
          onClick={() => router.back()}
          className="h-7 w-7 text-muted-foreground hover:text-foreground transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-offset-2"
          aria-label="Go back to previous page"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => window.location.reload()}
          className="h-7 w-7 text-muted-foreground hover:text-foreground transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-offset-2"
          aria-label="Go back to previous page"
        >
          <RefreshCwIcon className="h-4 w-4" />
        </Button>

      </div>

      <Link href={"/"}>
        <Image height={500} width={300} style={{ height: "30px", width: "auto" }} src="/logo.png" alt="Logo" />
      </Link>

      <div className="gap-2 flex">
        <Notificaciones />
        <ConfigMenu />
      </div>
    </nav>
  )
}
