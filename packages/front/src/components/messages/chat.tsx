"use client"

import { Button } from "@/components/ui/button"
import { CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useFileUploadHandler } from "@/hooks/file-upload"
import { useCreateMensajeMutation, useEditMensajeMutation, useGetMensajesQuery } from "@/hooks/mensaje"
import { useGetUsuariosQuery } from "@/hooks/usuario"
import { useStore } from "@/lib/store"
import type { Mensaje, Usuario } from "@/types"
import type { PaginationState } from "@tanstack/react-table"
import { Check, FileCheck, Paperclip, Send, Loader2, AtSign, X, Plus } from "lucide-react"
import type React from "react"
import { useRef, useState, useEffect } from "react"
import { FileViewer } from "../file-viewer"
import { ArchivosInput } from "../form-helpers/archivos-input"
import { format } from "date-fns"
import { PageTitle } from '@/components/ui/page-title'
import { formatTime } from "@/utils/date"

export default function ChatInbox({
  tipoId,
  tipo,
  title,
  children
}: {
  tipoId: number;
  tipo: string;
  title?: string;
  children?: React.ReactNode;
}) {
  // State for pagination and messages
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 200,
  })

  // Message input and file attachment states
  const [newMessage, setNewMessage] = useState("")
  const [file, setFile] = useState<File[]>([])
  const [fileShow, setFileShow] = useState<boolean>(false)
  const [showMenu, setShowMenu] = useState(false)

  // Referencias
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const mentionsListRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  // Usuario y menciones
  const { user } = useStore()
  const [usuarioDestino, setUsuarioDestino] = useState<Usuario | undefined>()
  const [showUserList, setShowUserList] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  // Queries and mutations
  const {
    data: mensajes = [],
    isFetching,
    refetch,
  } = useGetMensajesQuery({
    pagination,
    globalFilter: JSON.stringify({ tipoId, tipo }),
  })

  const { mutateAsync: edit } = useEditMensajeMutation()
  const { mutateAsync: create, isPending: isSending } = useCreateMensajeMutation()
  const { handleFileUpload } = useFileUploadHandler()

  const { data: dataUsuarios = [] } = useGetUsuariosQuery({
    pagination: {
      pageIndex: 0,
      pageSize: 100,
    },
  })

  // Usuarios filtrados para la lista
  const filteredUsers = searchTerm
    ? dataUsuarios.filter((user) => user.nombre?.toLowerCase().includes(searchTerm.toLowerCase()))
    : dataUsuarios

  // Cerrar el menú cuando se hace clic fuera de él
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (!isFetching && !isSending && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [mensajes, isFetching, isSending])

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowUserList(false)
        setFileShow(false)
      }
    }

    document.addEventListener("keydown", handleGlobalKeyDown)
    return () => {
      document.removeEventListener("keydown", handleGlobalKeyDown)
    }
  }, [])

  // Mark messages as seen
  useEffect(() => {
    if (!user?.userId) return

    mensajes.forEach((mensaje) => {
      if (mensaje.usuarioDestino === user.userId && !mensaje.fecha_visto) {
        marcarVisto(mensaje)
      }
    })
  }, [mensajes, user])

  // Send a new message
  const handleSendMessage = async () => {
    if (!newMessage.trim() && file.length === 0) return

    setFileShow(false)
    setShowMenu(false)

    try {
      const mensaje = await create({
        tipoId,
        tipo,
        mensaje: newMessage.trim(),
        usuarioOrigenId: user?.userId ?? 0,
        usuarioOrigenNombre: user?.nombre,
        usuarioDestino: usuarioDestino?.id,
        usuarioDestinoNombre: usuarioDestino?.nombre,
        fecha: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
      })


      if (mensaje.id && file.length > 0) {
        await handleFileUpload({
          modelo: "mensaje",
          modeloId: mensaje.id,
          tipo: "adjunto",
          fileArray: file,
        })
      }

      setNewMessage("")
      setFile([])
      setUsuarioDestino(undefined)
      refetch()
    } catch (error) {
      console.error("Error sending message:", error)
    }
  }

  // Mark a message as seen
  const marcarVisto = (mensaje: Mensaje) => {
    if (!mensaje?.id) return

    const data = {
      fecha_visto: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
    } as Mensaje

    edit({
      id: mensaje.id,
      data,
    })
  }


  // Seleccionar un usuario como destinatario
  const selectUser = (user: Usuario) => {
    setUsuarioDestino(user)
    setShowUserList(false)
    inputRef.current?.focus()
  }

  // Limpiar el usuario destinatario
  const clearDestinationUser = () => {
    setUsuarioDestino(undefined)
    inputRef.current?.focus()
  }

  // Manejar búsqueda en la lista de usuarios
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  // Abrir el selector de usuarios
  const openUserSelector = () => {
    setShowUserList(true)
    setSearchTerm("")
    setShowMenu(false)

    // Dar tiempo para que el DOM se actualice antes de enfocar
    setTimeout(() => {
      const searchInput = document.getElementById("user-search")
      if (searchInput) {
        searchInput.focus()
      }
    }, 100)
  }

  // Abrir el selector de archivos
  const toggleFileSelector = () => {
    setFileShow(!fileShow)
    setShowMenu(false)
  }

  // Manejar cambios en el campo de entrada
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setNewMessage(value)

    // Si el último carácter ingresado es "@", abrir el popup de selección
    if (value.endsWith("@")) {
      openUserSelector()
    }
  }

  // Manejar teclas especiales


  return (
    <div className="w-full h-full flex flex-col">
      {/* Header with title */}
      <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900  flex items-center justify-between">
        <PageTitle title={title || ""} />
        {children}
      </div>

      {/* Message area with scrolling */}
      <CardContent className="flex-grow overflow-y-auto p-4 flex flex-col">
        {isFetching && mensajes.length === 0 && (
          <div className="flex justify-center items-center py-8">
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 shadow-sm flex items-center">
              <Loader2 className="h-5 w-5 animate-spin mr-3 text-primary" />
              <span className="text-gray-700 dark:text-gray-300">Cargando conversación...</span>
            </div>
          </div>
        )}

        <div className="flex flex-col space-y-4">
          {mensajes.map((mensaje, index) => {
            const isCurrentUser = mensaje.usuarioOrigenId === user?.userId
            const isForMe = mensaje.usuarioDestino === user?.userId
            return (
              <div
                key={`mensaje-${mensaje.id || index}`}
                className={`mb-4 p-4 rounded-2xl shadow-sm transition-all duration-200 hover:shadow-md ${isCurrentUser ? "bg-primary/10 dark:bg-primary/20 ml-auto" : "bg-gray-100 dark:bg-gray-800 mr-auto"
                  } max-w-[80%] ${isForMe ? "border-l-4 border-primary" : ""}`}
              >
                <div className="flex justify-between gap-4 items-center mb-2">
                  <span className="font-semibold text-sm dark:text-gray-100">{mensaje.usuarioOrigenNombre}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">{formatTime(mensaje.fecha)}</span>
                </div>

                <p className="dark:text-gray-100 whitespace-pre-wrap break-words text-sm leading-relaxed">
                  {mensaje.mensaje}
                </p>

                {mensaje.file && (
                  <div className="mt-2 flex items-center">
                    <FileViewer archivo={mensaje.file} />
                  </div>
                )}

                <div className="flex flex-wrap  gap-4 justify-between items-center mt-3 pt-2 border-t border-gray-200 dark:border-gray-700">
                  {mensaje.usuarioDestino && (
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                      Para:{" "}
                      <span className="text-primary dark:text-primary-foreground">{mensaje.usuarioDestinoNombre}</span>
                    </p>
                  )}
                  {mensaje.fecha_visto && (
                    <div className="flex text-gray-500 dark:text-gray-400 justify-end text-xs items-center">
                      <span>Visto {formatTime(mensaje.fecha_visto)}</span>
                      <Check size={14} className="text-primary ml-1" />
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        <div ref={messagesEndRef} />
        {mensajes.length > 10 && (
          <div className="absolute bottom-20 right-6">
            <Button
              size="sm"
              variant="secondary"
              className="rounded-full shadow-md"
              onClick={() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })}
            >
              <div className="flex items-center space-x-1">
                <span>Abajo</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-down"><path d="m6 9 6 6 6-6" /></svg>
              </div>
            </Button>
          </div>
        )}
      </CardContent>

      <CardFooter className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 sticky bottom-0 left-0 right-0 z-10">
        <div className="w-full">
          {/* Mostrar usuario destinatario si está seleccionado */}
          {usuarioDestino && (
            <div className="mb-2 flex items-center">
              <div className="bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-foreground px-3 py-1 rounded-full flex items-center shadow-sm">
                <span className="mr-1 text-sm">Para: {usuarioDestino.nombre}</span>
                <button
                  onClick={clearDestinationUser}
                  className="text-primary/70 hover:text-primary transition-colors ml-1 p-1 rounded-full hover:bg-primary/10"
                  aria-label="Eliminar destinatario"
                >
                  <X size={12} />
                </button>
              </div>
            </div>
          )}

          {fileShow && (
            <div className="mb-4">
              <ArchivosInput className="w-full" value={file} setValue={setFile} />
            </div>
          )}

          {/* Modal de selección de usuario */}
          {showUserList && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-5 animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Seleccionar destinatario</h3>
                  <button
                    onClick={() => setShowUserList(false)}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="mb-4">
                  <Input
                    id="user-search"
                    placeholder="Buscar usuario..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="w-full focus-visible:ring-primary"
                  />
                </div>

                <div className="max-h-60 overflow-y-auto" ref={mentionsListRef}>
                  {filteredUsers.length === 0 ? (
                    <p className="text-center text-gray-500 dark:text-gray-400 py-4">No se encontraron usuarios</p>
                  ) : (
                    filteredUsers.map((user) => (
                      <div
                        key={user.id}
                        className="px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer rounded-md transition-colors flex items-center"
                        onClick={() => selectUser(user)}
                      >
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary mr-3">
                          {user.nombre?.charAt(0).toUpperCase()}
                        </div>
                        <div className="font-medium">{user.nombre}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {file.length > 0 && !fileShow && (
            <div className="mt-2 text-xs flex items-center bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 p-2 rounded-md">
              <FileCheck className="h-4 w-4 mr-1" />
              <span>
                {file.length} archivo{file.length > 1 ? "s" : ""} adjunto{file.length > 1 ? "s" : ""}
              </span>
              <button onClick={toggleFileSelector} className="ml-2 text-primary hover:underline font-medium">
                Ver
              </button>
            </div>
          )}

          <form
            className="flex w-full space-x-2 relative items-center "
            onSubmit={(e) => {
              e.preventDefault()
              handleSendMessage()
            }}
          >
            {/* Menú desplegable */}
            <div className="relative" ref={menuRef}>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => {
                  setShowMenu(!showMenu)
                  if (fileShow) {
                    setFileShow(false)
                  }
                }}
                aria-label="Opciones"
                className="dark:bg-gray-700 dark:text-gray-100 hover:bg-primary/10 hover:text-primary transition-colors"
              >
                <Plus className="h-4 w-4" />
              </Button>

              {showMenu && (
                <div className="absolute bottom-full left-0 mb-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg z-10 min-w-[180px] border border-gray-200 dark:border-gray-700 animate-in slide-in-from-bottom-2 duration-200">
                  <div
                    className="px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center transition-colors first:rounded-t-lg"
                    onClick={openUserSelector}
                  >
                    <AtSign className="h-4 w-4 mr-2 text-primary" />
                    <span className="text-sm">Mencionar usuario</span>
                  </div>
                  <div
                    className="px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center transition-colors last:rounded-b-lg"
                    onClick={toggleFileSelector}
                  >
                    <Paperclip className="h-4 w-4 mr-2 text-primary" />
                    <span className="text-sm">Adjuntar archivo</span>
                  </div>
                </div>
              )}
            </div>

            <Input
              ref={inputRef}
              value={newMessage}
              onChange={handleInputChange}
              placeholder="Escribe un mensaje... (usa @ para mencionar)"
              className="flex-grow dark:bg-gray-700 dark:text-gray-100 focus-visible:ring-primary pl-4 pr-4 py-6"
              disabled={isSending}
            />

            <Button
              type="submit"
              disabled={isSending || (newMessage.trim() === "" && file.length === 0)}
              aria-label="Enviar mensaje"
              className="bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-200"
            >
              {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </form>
        </div>
      </CardFooter>
    </div>
  )
}

