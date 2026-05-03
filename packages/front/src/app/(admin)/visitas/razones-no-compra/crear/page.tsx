import RazonNoCompraForm from '@/components/forms/razon-no-compra-form';
import { PageTitle } from '@/components/ui/page-title';

export default function CrearRazonNoCompraPage() {
  return (
    <>
      <PageTitle title="Nueva razón de no compra" />
      <RazonNoCompraForm />
    </>
  );
}
