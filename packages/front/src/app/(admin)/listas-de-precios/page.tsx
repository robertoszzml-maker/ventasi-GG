import { ListasPrecioTable } from '@/components/tables/listas-precio-table';
import { PageTitle } from '@/components/ui/page-title';

export default function ListasPrecioPage() {
  return (
    <>
      <PageTitle title="Listas de precios" />
      <ListasPrecioTable />
    </>
  );
}
