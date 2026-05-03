import { EjemplosTable } from '@/components/tables/ejemplos-table';
import { PageTitle } from '@/components/ui/page-title';

export default function EjemplosPage() {
  return (
    <>
      <PageTitle title="Ejemplos" />
      <EjemplosTable />
    </>
  );
}
