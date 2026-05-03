import { ArticulosTable } from '@/components/tables/articulos-table';
import { PageTitle } from '@/components/ui/page-title';

export default function ArticulosPage() {
  return (
    <>
      <PageTitle title="Artículos" />
      <ArticulosTable />
    </>
  );
}
