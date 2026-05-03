import { CurvasTalleTable } from '@/components/tables/curvas-talle-table';
import { PageTitle } from '@/components/ui/page-title';

export default function CurvasTallePage() {
  return (
    <>
      <PageTitle title="Curvas de Talle" />
      <CurvasTalleTable />
    </>
  );
}
