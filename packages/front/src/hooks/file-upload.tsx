import {
  useCreateArchivoMutation,
  useDeleteArchivoMutation,
  useEditArchivoMutation,
} from "@/hooks/archivo";

type FileUploadParams = {
  fileId?: number;
  fileArray: File[];
  modelo: string;
  modeloId: number;
  tipo: string;
};
type FileMultipleUploadParams = {
  data: any;
  fileArray: File[];
  modelo: string;
  modeloId: number;
  tipo: string;
};

export const useFileUploadHandler = () => {
  const { mutateAsync: createArchivo } = useCreateArchivoMutation();
  const { mutateAsync: deleteArchivo } = useDeleteArchivoMutation();
  const { mutateAsync: editArchivo } = useEditArchivoMutation();

  const handleFileUpload = async ({
    fileId,
    fileArray,
    modelo,
    modeloId,
    tipo,
  }: FileUploadParams) => {
    console.log(fileId, fileArray, fileArray.length);
    if (fileId && fileArray.length === 0) {
      deleteArchivo(fileId);
    }

    if (fileArray.length > 0) {
      if (fileId) {
        editArchivo({
          id: fileId,
          data: {
            modelo,
            modeloId,
            tipo,
          },
          file: fileArray[0],
        });
      } else {
        return await createArchivo({
          data: {
            modelo,
            modeloId,
            tipo,
          },
          file: fileArray[0],
        });
      }
    }
  };

  const handleMultipleFileUpload = async ({
    data,
    fileArray,
    modelo,
    modeloId,
    tipo,
  }: FileMultipleUploadParams) => {
    // TODO: Resolver esto, y hacerlo en un solo llamado
    try {
      for (const file of fileArray) {
        await createArchivo({
          data: {
            modelo,
            modeloId,
            tipo,
          },
          file,
        });
      }
      for (const file of data?.adjuntos || []) {
        await deleteArchivo(file.id);
      }
    } catch (error) {}
  };

  return { handleFileUpload, handleMultipleFileUpload };
};
