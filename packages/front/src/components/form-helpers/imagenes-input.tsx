"use client";

import {
  FileUploader,
  FileInput,
  FileUploaderContent,
  FileUploaderItem,
} from "@/components/ui/file-upload";
import Image from "next/image";
import { DropzoneOptions } from "react-dropzone";
import { Archivo } from "@/types";
import { Camera } from "lucide-react";
import { useDownloadArchivoByIdMutation } from "@/hooks/archivo";
import React from "react";
import { SkeletonThumb } from "@/components/skeletons/skeleton-thumb";
import { Label } from "@/components/ui/label";

// Definimos las props del componente
interface ImagenesInputProps {
  value: File[] | null; // Prop para el valor de los archivos
  setValue: (files: File[] | null) => void; // Prop para actualizar el valor de los archivos
  defaultValue?: Archivo[];
  label?: string;
}

const ImagenesInput = ({
  value,
  setValue,
  defaultValue,
  label,
}: ImagenesInputProps) => {
  const dropzone = {
    accept: {
      "image/*": [".jpg", ".jpeg", ".png"],
    },
    multiple: true,
    maxFiles: 5,
    maxSize: 10 * 1024 * 1024,
  } satisfies DropzoneOptions;
  const { mutateAsync, isPending } = useDownloadArchivoByIdMutation();
  React.useEffect(() => {
    const downloadFiles = async () => {
      if (defaultValue && defaultValue.length > 0) {
        const files = [];

        for (const fileInfo of defaultValue) {
          try {
            const response = await mutateAsync({ id: fileInfo.id });
            const file = new File(
              [response],
              fileInfo.nombreArchivoOriginal || "Archivo",
              {
                type: fileInfo.extension,
              }
            );
            files.push(file);
          } catch (error) {
            console.error("Error al descargar el archivo:", error);
          }
        }

        setValue(files);
      }
    };

    downloadFiles();
  }, []);

  return (
    <>
      <Label className="">{label}</Label>

      <FileUploader
        value={value} // Usamos la prop value
        onValueChange={setValue} // Usamos la prop setValue
        dropzoneOptions={dropzone}
        className="mt-2"
      >
        <FileInput>
          <div className="flex items-center justify-center h-20 w-full border bg-background rounded-md">
            {/* Ícono de la cámara */}
            <Camera className="text-gray-400 size-8" />
          </div>
        </FileInput>
        <FileUploaderContent className="flex items-center flex-row gap-2">
          {isPending && <SkeletonThumb />}
          {value?.map((file, i) => (
            <FileUploaderItem
              key={i}
              index={i}
              className="size-20 p-0 rounded-md overflow-hidden"
              aria-roledescription={`file ${i + 1} containing ${file.name}`}
              value={[]}
            >
              <a
                href={URL.createObjectURL(file)}
                target="_blank" // Abre en una nueva pestaña
                rel="noopener noreferrer" // Buenas prácticas de seguridad
              >
                <Image
                  src={URL.createObjectURL(file)}
                  alt={file.name}
                  height={80}
                  width={80}
                  className="size-20 p-0"
                />
              </a>
            </FileUploaderItem>
          ))}
        </FileUploaderContent>
      </FileUploader>
    </>
  );
};

export default ImagenesInput;
