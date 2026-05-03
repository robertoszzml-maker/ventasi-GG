import { RazonesNoCompraTable } from '@/components/tables/razones-no-compra-table';
import { PageTitle } from '@/components/ui/page-title';

export default function RazonesNoCompraPage() {
  return (
    <>
      <PageTitle title="Razones de no compra" />
      <RazonesNoCompraTable />
    </>
  );
}
