import {
  FileInput,
  FileUploader,
  FileUploaderContent,
  FileUploaderItem,
} from "@/components/ui/file-upload";
import { Label } from "@/components/ui/label";
import { useDownloadArchivoByIdQuery } from "@/hooks/archivo";
import { Archivo } from "@/types";
import { CloudUpload, Paperclip } from "lucide-react";
import React from "react";

type FileInputProps = {
  value: File[];
  setValue: (files?: File[] | null) => void;
  label: string;
  defaultValue?: Archivo;
  disabled?: boolean;
  onDelete?: () => void;
  variant?: "default" | "compact";
};

export const ArchivosInput = ({
  value,
  setValue,
  label,
  defaultValue,
  disabled = false,
  onDelete,
  variant = "default",
}: FileInputProps) => {
  const dropzone = {
    multiple: true,
    maxFiles: 3,
    maxSize: 10 * 1024 * 1024, // 10 MB
  };

  const { data } = useDownloadArchivoByIdQuery(defaultValue?.id);

  React.useEffect(() => {
    if (data && defaultValue && value.length === 0) {
      const file = new File(
        [data],
        defaultValue.nombreArchivoOriginal || "Archivo",
        {
          type: defaultValue.extension,
        }
      );
      setValue([file]); // Solo esta línea se añadió para setear el archivo por defecto
    }
  }, [data]);

  const isCompact = variant === "compact";

  return (
    <div>
      <Label className={isCompact ? "text-sm" : ""}>{label}</Label>
      <FileUploader
        value={value}
        onValueChange={setValue}
        dropzoneOptions={dropzone}
        reSelect={true}
        className="relative bg-background rounded-lg p-1"
      >
        {!disabled && (
          <FileInput
            id="fileInput"
            className="outline-dashed outline-1 outline-slate-500"
          >
            <div
              className={`flex items-center justify-center ${isCompact ? "flex-row gap-2 p-3" : "flex-col p-8"} w-full`}
            >
              <CloudUpload
                className={`text-gray-500 ${isCompact ? "w-5 h-5" : "w-10 h-10"}`}
              />
              <div className={isCompact ? "text-left" : "text-center"}>
                <p
                  className={`${isCompact ? "text-xs" : "mb-1 text-sm"} text-gray-500 dark:text-gray-400`}
                >
                  <span className="font-semibold">Haz clic para subir</span>
                  {!isCompact && <>&nbsp; o arrastra y suelta</>}
                </p>
                {!isCompact && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    SVG, PNG, JPG, GIF o PDF
                  </p>
                )}
              </div>
            </div>
          </FileInput>
        )}
        <FileUploaderContent className="flex flex-wrap gap-2">
          {value &&
            value.length > 0 &&
            value.map((file, i) => (
              <FileUploaderItem
                key={i}
                index={i}
                value={value}
                className="max-w-[200px] truncate" // Añade max-width y truncate
                onDelete={onDelete}
              >
                <Paperclip className="h-4 w-4 stroke-current flex-shrink-0" />
                <span className="truncate">{file.name}</span>
              </FileUploaderItem>
            ))}
        </FileUploaderContent>
      </FileUploader>
    </div>
  );
};
