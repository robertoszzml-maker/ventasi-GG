"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  useEditNotificacionMutation,
  useGetNotificacionesQuery,
  useDeleteNotificacionMutation,
} from "@/hooks/notificacion"
import { useStore } from "@/lib/store"
import type { Notificacion } from "@/types"
import type { PaginationState } from "@tanstack/react-table"
import {
  Bell,
  Check,
  ChevronDown,
  Clock,
  FileText,
  MessageSquare,
  Package,
  Settings,
  Trash2,
  Calendar,
  AlertCircle,
} from "lucide-react"
import Link from "next/link"
import React, { useRef, useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const media = window.matchMedia(query)
    if (media.matches !== matches) {
      setMatches(media.matches)
    }

    const listener = () => setMatches(media.matches)
    media.addEventListener("change", listener)

    return () => media.removeEventListener("change", listener)
  }, [matches, query])

  return matches
}

export default function Notificaciones() {
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })

  const { user } = useStore()
  const [activeTab, setActiveTab] = useState("all")
  const [isOpen, setIsOpen] = React.useState(false)
  const [unreadCount, setUnreadCount] = React.useState<number>(0)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [markingAsRead, setMarkingAsRead] = useState<Record<string | number, boolean>>({})
  const [isMarkingAllAsRead, setIsMarkingAllAsRead] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const { toast } = useToast()

  const { status, data, error, isFetching, isPlaceholderData, isLoading, refetch } = useGetNotificacionesQuery({
    pagination,
    globalFilter: JSON.stringify({ usuarioDestinoId: user?.userId, crud: 0 }),
  })

  const { mutateAsync: editNotification } = useEditNotificacionMutation()
  const { mutateAsync: deleteNotification } = useDeleteNotificacionMutation()
  // Agrupar notificaciones por fecha
  const groupedNotifications = React.useMemo(() => {
    if (!data) return {}

    const grouped: Record<string, Notificacion[]> = {}

    data.forEach((notification) => {
      if (!notification.fecha) return
      const date = new Date(notification.fecha)
      const today = new Date()
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)

      let groupKey = ""

      if (date.toDateString() === today.toDateString()) {
        groupKey = "Hoy"
      } else if (date.toDateString() === yesterday.toDateString()) {
        groupKey = "Ayer"
      } else {
        // Formato: "1 Ene", "15 Mar", etc.
        const day = date.getDate()
        const month = date.toLocaleString("es-ES", { month: "short" })
        groupKey = `${day} ${month}`
      }

      if (!grouped[groupKey]) {
        grouped[groupKey] = []
      }

      grouped[groupKey].push(notification)
    })

    return grouped
  }, [data])

  const formatDate = (date?: string) => {
    let result = ""
    if (date) {
      const fecha = date?.split("T")[0]?.split("-")?.reverse()?.join("/")
      const hora = date?.split("T")[1]?.slice(0, 5)
      result = `${fecha} ${hora}Hs`
    }
    return result
  }

  const formatRelativeTime = (dateString?: string) => {
    if (!dateString) return ""

    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) {
      return "hace un momento"
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60)
      return `hace ${minutes} ${minutes === 1 ? "minuto" : "minutos"}`
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600)
      return `hace ${hours} ${hours === 1 ? "hora" : "horas"}`
    } else if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400)
      return `hace ${days} ${days === 1 ? "día" : "días"}`
    } else {
      return formatDate(dateString)
    }
  }

  const loadMoreMessages = () => {
    setPagination({
      pageIndex: pagination.pageIndex,
      pageSize: pagination.pageSize + 10,
    })
  }

  const handleNotificationClick = async (notification: Notificacion) => {
    if (notification?.id && !notification.fechaVisto) {
      await editNotification({ id: notification.id, data: { ...notification, fechaVisto: new Date().toISOString() } })
      setUnread()
    }
  }

  const handleDeleteNotificaciones = async () => {
    setIsDeleteDialogOpen(true)
  }

  const confirmDeleteAllNotifications = async () => {
    try {
      // Close the dialog and popover first for better UX
      setIsDeleteDialogOpen(false)
      setIsOpen(false)

      // Pequeño retraso para asegurar que el Popover se cierre antes de mostrar el toast
      setTimeout(async () => {
        // Show loading state
        toast({
          title: "Eliminando notificaciones",
          description: "Espere un momento...",
        })

        // Delete all notifications for the current user
        if (data && data.length > 0) {
          for (const notification of data) {
            if (notification.id) {
              await deleteNotification({ id: notification.id })
            }
          }
        }

        // Refresh the notifications list
        await refetch()

        // Show success message
        toast({
          title: "Notificaciones eliminadas",
          description: "Todas las notificaciones han sido eliminadas correctamente.",
          variant: "success",
        })
      }, 100)
    } catch (error) {
      console.error("Error al eliminar notificaciones:", error)
      toast({
        title: "Error",
        description: "No se pudieron eliminar las notificaciones. Intente nuevamente.",
        variant: "destructive",
      })
    }
  }

  const markAsRead = async (notification: Notificacion, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }

    if (notification?.id && !notification.fechaVisto) {
      setMarkingAsRead((prev) => ({ ...prev, [notification.id!]: true }))

      try {
        await editNotification({
          id: notification.id,
          data: { ...notification, fechaVisto: new Date().toISOString() },
        })
        await refetch()
      } catch (error) {
        console.error("Error al marcar como leído:", error)
      } finally {
        setMarkingAsRead((prev) => ({ ...prev, [notification.id!]: false }))
      }
    }
  }

  const markAllAsRead = async () => {
    const unreadNotifications = data?.filter((n) => !n.fechaVisto) || []

    if (unreadNotifications.length === 0) return

    setIsMarkingAllAsRead(true)

    try {
      for (const notification of unreadNotifications) {
        if (notification?.id) {
          await editNotification({
            id: notification.id,
            data: { ...notification, fechaVisto: new Date().toISOString() },
          })
        }
      }
      await refetch()
    } catch (error) {
      console.error("Error al marcar todas como leídas:", error)
    } finally {
      setIsMarkingAllAsRead(false)
    }
  }

  React.useEffect(() => {
    setUnread()
  }, [data])

  const setUnread = () => {
    if (data?.some((e) => !Boolean(e.fechaVisto) && e.usuarioDestinoId !== 0)) {
      setUnreadCount(data?.filter((n) => !n.fechaVisto).length || 0)
    } else {
      setUnreadCount(0)
    }
  }

  const getNotificationIcon = (notification: Notificacion) => {
    switch (notification.tipo) {
      case "presupuesto":
        return notification.tipoNotificacion === "mensaje" ? (
          <MessageSquare className="w-5 h-5" />
        ) : (
          <FileText className="w-5 h-5" />
        )
      case "alquiler":
        return notification.tipoNotificacion === "mensaje" ? (
          <MessageSquare className="w-5 h-5" />
        ) : (
          <Package className="w-5 h-5" />
        )
      case "solcom":
        return notification.tipoNotificacion === "mensaje" ? (
          <MessageSquare className="w-5 h-5" />
        ) : (
          <FileText className="w-5 h-5" />
        )
      case "oferta":
        return <FileText className="w-5 h-5" />
      default:
        return <Bell className="w-5 h-5" />
    }
  }

  const getNotificationUrl = (notification: Notificacion) => {
    let url = "#"
    switch (notification.tipo) {
      case "presupuesto":
        url =
          notification.tipoNotificacion === "mensaje"
            ? `/presupuestos/${notification.tipoId}/mensajes`
            : `/presupuestos/${notification.tipoId}`
        break
      case "alquiler":
        url =
          notification.tipoNotificacion === "mensaje"
            ? `/alquileres/${notification.tipoId}/mensajes`
            : `/alquileres/${notification.tipoId}`
        break
      case "solcom":
        url =
          notification.tipoNotificacion === "mensaje"
            ? `/solcom/${notification.tipoId}/mensajes`
            : `/solcom/${notification.tipoId}`
        break
      case "oferta":
        url = `/ofertas/${notification.tipoId}`
        break
      default:
        url = "#"
        break
    }
    return url
  }

  const getNotificationPriority = (notification: Notificacion) => {
    // Determinar prioridad basada en tipo o contenido
    if (notification.nota?.toLowerCase().includes("urgente")) {
      return "high"
    }

    if (notification.tipoNotificacion === "mensaje") {
      return "medium"
    }

    return "normal"
  }

  const handleDeleteNotification = async (notification: Notificacion, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }

    if (notification?.id) {
      try {
        // Cerrar el Popover antes de mostrar el toast
        setIsOpen(false)

        await deleteNotification({ id: notification.id })
        await refetch()

        // Mostrar el toast después de cerrar el Popover
        setTimeout(() => {
          toast({
            title: "Notificación eliminada",
            description: "La notificación ha sido eliminada correctamente.",
            variant: "success",
          })
        }, 100)
      } catch (error) {
        console.error("Error al eliminar la notificación:", error)
        setTimeout(() => {
          toast({
            title: "Error",
            description: "No se pudo eliminar la notificación. Intente nuevamente.",
            variant: "destructive",
          })
        }, 100)
      }
    }
  }

  const renderNotification = (notification: Notificacion) => {
    const url = getNotificationUrl(notification)
    const isUnread = !notification.fechaVisto
    const priority = getNotificationPriority(notification)
    const isMarking = markingAsRead[notification.id!]

    return (
      <Card
        key={notification.id}
        className={cn(
          "mb-3 overflow-hidden border transition-all duration-200 hover:shadow-md focus-within:ring-2 focus-within:ring-blue-500",
          isUnread ? "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800" : "bg-card",
          priority === "high" && "border-l-4 border-l-red-500",
          priority === "medium" && "border-l-4 border-l-yellow-500",
        )}
      >
        <CardContent className="p-0">
          <Link
            className="block p-3 sm:p-2 outline-none focus:bg-blue-50/50 dark:focus:bg-blue-950/20"
            href={url}
            onClick={() => handleNotificationClick(notification)}
          >
            <div className="flex items-start gap-3 sm:gap-2">
              <div
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-full sm:h-8 sm:w-8",
                  isUnread
                    ? "bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400"
                    : "bg-muted text-muted-foreground",
                )}
              >
                {getNotificationIcon(notification)}
              </div>

              <div className="flex-1 space-y-1">
                <div className="flex items-start justify-between">
                  <p
                    className={cn(
                      "text-sm sm:text-xs",
                      isUnread ? "font-medium text-foreground" : "text-muted-foreground",
                    )}
                  >
                    {notification.nota ?? ""}
                  </p>
                  {isUnread && (
                    <Badge
                      variant="default"
                      className="ml-2 bg-blue-500 hover:bg-blue-600 text-xs sm:text-[10px] sm:px-1.5 sm:py-0"
                    >
                      Nuevo
                    </Badge>
                  )}
                </div>

                <div className="flex items-center text-xs sm:text-[10px] text-muted-foreground gap-2 sm:gap-1">
                  <Clock className="h-3 w-3 sm:h-2.5 sm:w-2.5" />
                  <span>{formatRelativeTime(notification.fecha)}</span>
                </div>

                {notification.tipo && (
                  <Badge variant="outline" className="mt-1 text-xs sm:text-[10px] sm:px-1.5 sm:py-0">
                    {notification.tipo === "presupuesto"
                      ? "Presupuesto"
                      : notification.tipo === "alquiler"
                      ? "Alquiler"
                      : notification.tipo === "solcom"
                      ? "Solicitud de Compra"
                      : notification.tipo}
                    {notification.tipoNotificacion === "mensaje" && " - Mensaje"}
                  </Badge>
                )}
              </div>
            </div>
          </Link>

          <div className="flex items-center justify-end px-3 pb-2 sm:px-2 sm:pb-1">
            {isUnread && (
              <Button
                size="sm"
                variant="ghost"
                className="h-8 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/50 sm:h-7 sm:text-[10px] sm:px-2"
                onClick={(e) => markAsRead(notification, e)}
                disabled={isMarking}
              >
                {isMarking ? (
                  <>
                    <span className="mr-1 h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                    Marcando...
                  </>
                ) : (
                  <>
                    <Check className="mr-1 h-3 w-3 sm:h-2.5 sm:w-2.5" />
                    Marcar como leído
                  </>
                )}
              </Button>
            )}
            {/* Botón de eliminar (siempre visible) */}
            <Button
              size="sm"
              variant="ghost"
              className={`h-8 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/50 sm:h-7 sm:text-[10px] sm:px-2 ${isUnread ? "ml-2" : ""}`}
              onClick={(e) => handleDeleteNotification(notification, e)}
            >
              <Trash2 className="mr-1 h-3 w-3 sm:h-2.5 sm:w-2.5" />
              Eliminar
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const filteredNotifications = React.useMemo(() => {
    if (activeTab === "all") return data || []
    if (activeTab === "unread") return (data || []).filter((n) => !n.fechaVisto)
    return data || []
  }, [data, activeTab])

  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center py-10 px-4 sm:py-6 sm:px-3 text-center">
      <div className="rounded-full bg-muted p-3 mb-4 sm:p-2 sm:mb-3">
        <Bell className="h-6 w-6 sm:h-5 sm:w-5 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-medium sm:text-base">No hay notificaciones</h3>
      <p className="text-sm sm:text-xs text-muted-foreground mt-1 mb-4 sm:mb-3">
        {activeTab === "unread"
          ? "No tienes notificaciones sin leer"
          : "Cuando recibas notificaciones, aparecerán aquí"}
      </p>
      {activeTab === "unread" && (
        <Button variant="outline" size="sm" className="sm:text-xs" onClick={() => setActiveTab("all")}>
          Ver todas las notificaciones
        </Button>
      )}
    </div>
  )

  return (
    <TooltipProvider>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <Tooltip>
          <TooltipTrigger asChild>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="relative  focus-visible:ring-2 focus-visible:ring-blue-500"
                aria-label={`Notificaciones${unreadCount > 0 ? ` (${unreadCount} sin leer)` : ""}`}
              >
                <Bell className="h-[1.2rem] w-[1.2rem]" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 sm:h-4 sm:w-4 items-center justify-center rounded-full bg-blue-500 text-[10px] font-medium text-white">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
          </TooltipTrigger>
          <TooltipContent side="bottom">Notificaciones {unreadCount > 0 && `(${unreadCount} sin leer)`}</TooltipContent>
        </Tooltip>

        <PopoverContent
          className="w-[380px] p-0 md:w-[380px] sm:w-full sm:max-w-[95vw]"
          align="end"
          side="bottom"
          sideOffset={5}
          alignOffset={0}
        >
          <div className="flex items-center justify-between px-4 py-3 sm:px-3 sm:py-2 border-b">
            <h3 className="font-semibold sm:text-sm">Notificaciones</h3>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 text-xs sm:h-7 sm:text-[10px] sm:px-2"
                      onClick={markAllAsRead}
                      disabled={isMarkingAllAsRead}
                    >
                      {isMarkingAllAsRead ? (
                        <>
                          <span className="mr-1 h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                          <span className="sm:hidden">Marcando...</span>
                          <span className="hidden sm:inline">...</span>
                        </>
                      ) : (
                        <>
                          <Check className="mr-1 h-3 w-3 sm:h-2.5 sm:w-2.5" />
                          <span className="sm:hidden">Marcar todo como leído</span>
                          <span className="hidden sm:inline">Marcar todo</span>
                        </>
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">Marcar todas como leídas</TooltipContent>
                </Tooltip>
              )}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-7 sm:w-7">
                    <Settings className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">Configuración de notificaciones</TooltipContent>
              </Tooltip>
            </div>
          </div>

          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <div className="px-4 py-2 sm:px-2 sm:py-1 border-b">
              <TabsList className="w-full">
                <TabsTrigger value="all" className="flex-1 sm:text-xs sm:py-1">
                  Todas
                </TabsTrigger>
                <TabsTrigger value="unread" className="flex-1 sm:text-xs sm:py-1">
                  Sin leer {unreadCount > 0 && `(${unreadCount})`}
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="all" className="m-0">
              {status === "pending" ? (
                <div className="flex justify-center items-center py-8 sm:py-6">
                  <div className="animate-pulse flex flex-col items-center">
                    <div className="h-12 w-12 sm:h-10 sm:w-10 rounded-full bg-muted mb-4 sm:mb-3"></div>
                    <div className="h-4 w-32 sm:h-3 sm:w-28 bg-muted rounded mb-2"></div>
                    <div className="h-3 w-24 sm:h-2 sm:w-20 bg-muted rounded"></div>
                  </div>
                </div>
              ) : status === "error" ? (
                <div className="flex flex-col items-center justify-center py-8 px-4 sm:py-6 sm:px-3 text-center">
                  <div className="rounded-full bg-red-100 p-3 mb-4 sm:p-2 sm:mb-3">
                    <AlertCircle className="h-6 w-6 sm:h-5 sm:w-5 text-red-600" />
                  </div>
                  <h3 className="text-lg font-medium sm:text-base">Error al cargar notificaciones</h3>
                  <p className="text-sm sm:text-xs text-muted-foreground mt-1 mb-4 sm:mb-3">
                    Hubo un problema al cargar tus notificaciones
                  </p>
                  <Button variant="outline" size="sm" className="sm:text-xs" onClick={() => refetch()}>
                    Intentar nuevamente
                  </Button>
                </div>
              ) : filteredNotifications.length === 0 ? (
                renderEmptyState()
              ) : (
                <ScrollArea className="h-[400px] sm:h-[350px]">
                  <div className="p-3">
                    {Object.entries(groupedNotifications).map(([date, notifications]) => (
                      <div key={date} className="mb-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <h4 className="text-sm font-medium text-muted-foreground">{date}</h4>
                          <Separator className="flex-1" />
                        </div>

                        {notifications.map((notification) => (
                          <React.Fragment key={notification.id}>{renderNotification(notification)}</React.Fragment>
                        ))}
                      </div>
                    ))}

                    {filteredNotifications.length >= pagination.pageSize && (
                      <div className="flex justify-center mt-2 mb-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={loadMoreMessages}
                          disabled={isFetching}
                          className="w-full text-sm sm:text-xs font-medium"
                        >
                          {isFetching || isLoading ? (
                            <span className="flex items-center">
                              <span className="mr-2 h-4 w-4 sm:h-3 sm:w-3 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                              Cargando...
                            </span>
                          ) : (
                            <span className="flex items-center">
                              Cargar más notificaciones
                              <ChevronDown className="ml-1 h-4 w-4 sm:h-3 sm:w-3" />
                            </span>
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                  <div ref={messagesEndRef} />
                </ScrollArea>
              )}
            </TabsContent>

            <TabsContent value="unread" className="m-0">
              {status === "pending" ? (
                <div className="flex justify-center items-center py-8 sm:py-6">
                  <div className="animate-pulse flex flex-col items-center">
                    <div className="h-12 w-12 sm:h-10 sm:w-10 rounded-full bg-muted mb-4 sm:mb-3"></div>
                    <div className="h-4 w-32 sm:h-3 sm:w-28 bg-muted rounded mb-2"></div>
                    <div className="h-3 w-24 sm:h-2 sm:w-20 bg-muted rounded"></div>
                  </div>
                </div>
              ) : filteredNotifications.length === 0 ? (
                renderEmptyState()
              ) : (
                <ScrollArea className="h-[400px] sm:h-[350px]">
                  <div className="p-3">
                    {Object.entries(groupedNotifications)
                      .filter(([_, notifications]) => notifications.some((n) => !n.fechaVisto))
                      .map(([date, notifications]) => (
                        <div key={date} className="mb-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <h4 className="text-sm font-medium text-muted-foreground">{date}</h4>
                            <Separator className="flex-1" />
                          </div>

                          {notifications
                            .filter((n) => !n.fechaVisto)
                            .map((notification) => (
                              <React.Fragment key={notification.id}>{renderNotification(notification)}</React.Fragment>
                            ))}
                        </div>
                      ))}
                  </div>
                  <div ref={messagesEndRef} />
                </ScrollArea>
              )}
            </TabsContent>
          </Tabs>

          <Separator />

          <div className="p-2 sm:p-1.5 border-t">
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-xs sm:text-[10px] justify-center text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                  onClick={handleDeleteNotificaciones}
                  disabled={!data || data.length === 0}
                >
                  <Trash2 className="mr-1 h-3 w-3 sm:h-2.5 sm:w-2.5" />
                  Limpiar todas las notificaciones
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>¿Eliminar todas las notificaciones?</DialogTitle>
                  <DialogDescription>
                    Esta acción eliminará permanentemente todas tus notificaciones. Esta acción no se puede deshacer.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={confirmDeleteAllNotifications} className="bg-red-500 hover:bg-red-600">
                    Eliminar
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </PopoverContent>
      </Popover>
    </TooltipProvider>
  )
}

