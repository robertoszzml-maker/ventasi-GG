"use client";

import React from "react";
import { Archivo } from "@/types";
import { useDownloadArchivoByIdQuery } from "@/hooks/archivo";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type ImageCarouselItemProps = {
  archivo: Archivo;
};

const ImageCarouselItem = ({ archivo }: ImageCarouselItemProps) => {
  const { data, isLoading } = useDownloadArchivoByIdQuery(archivo?.id);

  const objectUrl = React.useMemo(() => {
    if (!data) return null;
    const blob = new Blob([data], { type: archivo.extension });
    return URL.createObjectURL(blob);
  }, [data, archivo.extension]);

  React.useEffect(() => {
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [objectUrl]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48 bg-muted rounded-md animate-pulse">
        <span className="text-sm text-muted-foreground">Cargando...</span>
      </div>
    );
  }

  if (!objectUrl) {
    return (
      <div className="flex items-center justify-center h-48 bg-muted rounded-md">
        <span className="text-sm text-muted-foreground">Sin imagen</span>
      </div>
    );
  }

  return (
    <a href={objectUrl} target="_blank" rel="noopener noreferrer" className="block">
      <img
        src={objectUrl}
        alt={archivo.nombreArchivoOriginal || "Imagen"}
        className="w-full max-h-[60vh] object-contain rounded-md"
      />
    </a>
  );
};

// — Carousel puro (sin dialog) —
type ImageCarouselProps = {
  archivos: Archivo[];
};

const ImageCarouselInner = ({ archivos }: ImageCarouselProps) => {
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    if (!api) return;
    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);
    api.on("select", () => setCurrent(api.selectedScrollSnap() + 1));
  }, [api]);

  if (!archivos.length) return null;

  return (
    <div className="space-y-2 w-full overflow-hidden">
      <Carousel setApi={setApi} opts={{ loop: archivos.length > 1 }}>
        <CarouselContent>
          {archivos.map((archivo) => (
            <CarouselItem key={archivo.id}>
              <ImageCarouselItem archivo={archivo} />
            </CarouselItem>
          ))}
        </CarouselContent>
        {archivos.length > 1 && (
          <>
            <CarouselPrevious className="left-2" />
            <CarouselNext className="right-2" />
          </>
        )}
      </Carousel>
      {archivos.length > 1 && (
        <p className="text-center text-xs text-muted-foreground">
          {current} / {count}
        </p>
      )}
    </div>
  );
};

// — Carousel con dialog integrado —
type ImageCarouselDialogProps = {
  archivos: Archivo[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
};

export const ImageCarouselDialog = ({
  archivos,
  open,
  onOpenChange,
  title = "Fotos del producto",
}: ImageCarouselDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[80vw] max-w-[80vw]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <ImageCarouselInner archivos={archivos} />
      </DialogContent>
    </Dialog>
  );
};
