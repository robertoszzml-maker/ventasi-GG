import { FamiliasTable } from '@/components/tables/familias-table';
import { PageTitle } from '@/components/ui/page-title';

export default function FamiliasPage() {
  return (
    <>
      <PageTitle title="Familias" />
      <FamiliasTable />
    </>
  );
}
