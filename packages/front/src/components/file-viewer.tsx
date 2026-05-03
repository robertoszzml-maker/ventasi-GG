import { useDownloadArchivoByIdQuery } from '@/hooks/archivo';
import { Archivo } from "@/types";

type FileViewerProps = {
    archivo: Archivo;
};

export const FileViewer = ({ archivo }: FileViewerProps) => {
    const { isLoading, refetch } = useDownloadArchivoByIdQuery(archivo?.id, { enabled: false });

    const handleViewFile = async () => {
        const result = await refetch();
        if (result.data) {
            const fileBlob = new Blob([result.data], { type: archivo.extension });
            const fileUrl = URL.createObjectURL(fileBlob);
            window.open(fileUrl, '_blank');
        }
    };

    return (
        <a
            href="#"
            onClick={(e) => {
                e.preventDefault(); // Previene la navegación por defecto
                handleViewFile();
            }}
            style={{ textDecoration: 'underline', color: 'blue', cursor: 'pointer' }}
        >
            {isLoading ? 'Cargando...' : archivo?.nombreArchivoOriginal}
        </a>
    );
};
