import { EjemploCategoriasTable } from '@/components/tables/ejemplo-categorias-table';
import { PageTitle } from '@/components/ui/page-title';

export default function EjemploCategoriasPage() {
  return (
    <>
      <PageTitle title="Categorías de Ejemplo" />
      <EjemploCategoriasTable />
    </>
  );
}
