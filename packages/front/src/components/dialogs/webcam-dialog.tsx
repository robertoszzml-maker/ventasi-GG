"use client"

import { useRef, useState, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Camera, X, RotateCcw, Check } from "lucide-react"

interface WebcamDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCapture: (imageDataUrl: string) => void
  width?: number
  height?: number
}

export function WebcamDialog({ open, onOpenChange, onCapture, width = 640, height = 480 }: WebcamDialogProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)

  const startCamera = useCallback(async () => {
    try {
      setError(null)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width, height },
        audio: false,
      })

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setIsStreaming(true)
      }
    } catch (err) {
      console.error("Error al acceder a la cámara:", err)
      setError("No se pudo acceder a la cámara. Verifica los permisos.")
    }
  }, [width, height])

  const stopCamera = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach((track) => track.stop())
      videoRef.current.srcObject = null
      setIsStreaming(false)
    }
  }, [])

  useEffect(() => {
    if (open) {
      startCamera()
      setCapturedImage(null)
    } else {
      stopCamera()
    }

    return () => {
      stopCamera()
    }
  }, [open, startCamera, stopCamera])

  const capturePhoto = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext("2d")
      if (context) {
        canvasRef.current.width = width
        canvasRef.current.height = height
        context.drawImage(videoRef.current, 0, 0, width, height)
        const imageDataUrl = canvasRef.current.toDataURL("image/png")
        setCapturedImage(imageDataUrl)
        stopCamera()
      }
    }
  }, [width, height, stopCamera])

  const confirmPhoto = useCallback(() => {
    if (capturedImage) {
      onCapture(capturedImage)
      setCapturedImage(null)
      onOpenChange(false)
    }
  }, [capturedImage, onCapture, onOpenChange])

  const retakePhoto = useCallback(() => {
    setCapturedImage(null)
    startCamera()
  }, [startCamera])

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setCapturedImage(null)
    }
    onOpenChange(open)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Capturar Foto</DialogTitle>
          <DialogDescription>
            {capturedImage ? "¿Te gusta esta foto?" : "Posiciona tu rostro frente a la cámara y captura la foto"}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4 py-4">
          {error && <div className="w-full rounded-lg bg-destructive/10 p-4 text-sm text-destructive">{error}</div>}

          <div className="relative overflow-hidden rounded-lg bg-muted" style={{ width: "100%", maxWidth: width }}>
            <div style={{ aspectRatio: `${width} / ${height}` }} className="relative">
              {capturedImage ? (
                <img
                  src={capturedImage || "/placeholder.svg"}
                  alt="Foto capturada"
                  className="h-full w-full object-cover"
                />
              ) : (
                <>
                  {!isStreaming && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Camera className="h-16 w-16 text-muted-foreground" />
                    </div>
                  )}

                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className={`h-full w-full object-cover ${!isStreaming ? "hidden" : ""}`}
                  />
                </>
              )}
            </div>
          </div>

          <canvas ref={canvasRef} className="hidden" />
        </div>

        <DialogFooter>
          {capturedImage ? (
            <>
              <Button onClick={retakePhoto} variant="outline">
                <RotateCcw className="mr-2 h-4 w-4" />
                Tomar Otra
              </Button>
              <Button onClick={confirmPhoto}>
                <Check className="mr-2 h-4 w-4" />
                Usar Esta Foto
              </Button>
            </>
          ) : (
            <>
              <Button onClick={() => handleOpenChange(false)} variant="outline">
                <X className="mr-2 h-4 w-4" />
                Cancelar
              </Button>
              <Button onClick={capturePhoto} disabled={!isStreaming}>
                <Camera className="mr-2 h-4 w-4" />
                Capturar Foto
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
