import ArticuloForm from '@/components/forms/articulo-form';
import { PageTitle } from '@/components/ui/page-title';

export default function CrearArticuloPage() {
  return (
    <>
      <PageTitle title="Nuevo Artículo" />
      <ArticuloForm />
    </>
  );
}
