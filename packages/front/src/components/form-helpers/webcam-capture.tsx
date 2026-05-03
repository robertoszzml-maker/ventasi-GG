"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Camera, Trash2, Expand, Upload } from "lucide-react";
import { WebcamDialog } from "@/components/dialogs/webcam-dialog";
import { ImagePreviewDialog } from "@/components/dialogs/image-preview-dialog";

interface WebcamCaptureProps {
  value?: string | null;
  onChange?: (imageDataUrl: string | null) => void;
  className?: string;
  disabled?: boolean;
}

export function WebcamCapture({
  value,
  onChange,
  className = "",
  disabled = false,
}: WebcamCaptureProps) {
  const [openWebcam, setOpenWebcam] = useState(false);
  const [openPreview, setOpenPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCapture = (imageDataUrl: string) => {
    onChange?.(imageDataUrl);
  };

  const handleRemove = () => {
    onChange?.(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onChange?.(reader.result as string);
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  return (
    <>
      <div className={className}>
        {/* Cuadrado con la foto o placeholder */}
        <div className="relative w-48 h-48 rounded-lg overflow-hidden border-2 border-border bg-muted">
          {value ? (
            <img
              src={value}
              alt="Foto de perfil"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
              <Camera className="w-20 h-20 text-gray-400" />
            </div>
          )}

          {/* Input de archivo oculto */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />

          {/* Botones superpuestos */}
          <div className="absolute top-2 right-2 flex flex-col gap-2">
            <Button
              type="button"
              onClick={() => setOpenWebcam(true)}
              variant="secondary"
              size="icon"
              disabled={disabled}
              title="Tomar Foto"
              className="h-8 w-8 shadow-md"
            >
              <Camera className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              variant="secondary"
              size="icon"
              disabled={disabled}
              title="Subir imagen"
              className="h-8 w-8 shadow-md"
            >
              <Upload className="h-4 w-4" />
            </Button>
            {value && (
              <>
                <Button
                  type="button"
                  onClick={() => setOpenPreview(true)}
                  variant="secondary"
                  size="icon"
                  disabled={disabled}
                  title="Expandir"
                  className="h-8 w-8 shadow-md"
                >
                  <Expand className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  onClick={handleRemove}
                  variant="secondary"
                  size="icon"
                  disabled={disabled}
                  title="Eliminar"
                  className="h-8 w-8 shadow-md"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Diálogo de webcam */}
      <WebcamDialog
        open={openWebcam}
        onOpenChange={setOpenWebcam}
        onCapture={handleCapture}
      />

      {/* Diálogo de vista previa */}
      <ImagePreviewDialog
        open={openPreview}
        onOpenChange={setOpenPreview}
        imageUrl={value}
        title="Foto de Perfil"
      />
    </>
  );
}
