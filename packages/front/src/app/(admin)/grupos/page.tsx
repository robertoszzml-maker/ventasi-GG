import { GruposTable } from '@/components/tables/grupos-table';
import { PageTitle } from '@/components/ui/page-title';

export default function GruposPage() {
  return (
    <>
      <PageTitle title="Grupos" />
      <GruposTable />
    </>
  );
}
