import { CaracteristicasVisitanteTable } from '@/components/tables/caracteristicas-visitante-table';
import { PageTitle } from '@/components/ui/page-title';

export default function CaracteristicasVisitantePage() {
  return (
    <>
      <PageTitle title="Características de visitante" />
      <CaracteristicasVisitanteTable />
    </>
  );
}
