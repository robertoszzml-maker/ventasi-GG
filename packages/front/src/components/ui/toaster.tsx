// src/components/ui/toaster.tsx
'use client'

import { useEffect } from 'react'
import { useToast } from "@/hooks/use-toast"
import { setToast } from "@/lib/toast" // Asegúrate de importar esto
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"

export function Toaster() {
  const { toasts, toast } = useToast()

  useEffect(() => {
    setToast(toast);  // Configuramos el toastService con la función toast
  }, [toast]);

  return (
    <ToastProvider>
      {toasts.map(({ id, title, description, action, ...props }) => (
        <Toast key={id} {...props}>
          <div className="grid gap-1">
            {title && <ToastTitle>{title}</ToastTitle>}
            {description && (
              <ToastDescription>{description}</ToastDescription>
            )}
          </div>
          {action}
          <ToastClose />
        </Toast>
      ))}
      <ToastViewport />
    </ToastProvider>
  )
}
