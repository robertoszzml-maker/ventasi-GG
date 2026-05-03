import { ColoresTable } from '@/components/tables/colores-table';
import { PageTitle } from '@/components/ui/page-title';

export default function ColoresPage() {
  return (
    <>
      <PageTitle title="Colores" />
      <ColoresTable />
    </>
  );
}
