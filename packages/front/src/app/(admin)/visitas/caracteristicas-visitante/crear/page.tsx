import CaracteristicaVisitanteForm from '@/components/forms/caracteristica-visitante-form';
import { PageTitle } from '@/components/ui/page-title';

export default function CrearCaracteristicaPage() {
  return (
    <>
      <PageTitle title="Nueva característica de visitante" />
      <CaracteristicaVisitanteForm />
    </>
  );
}
