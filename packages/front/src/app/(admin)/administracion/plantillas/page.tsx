import PlantillaNotificacionTable from "@/components/tables/plantilla-notificacion-table";
import { PageTitle } from "@/components/ui/page-title";

export default function PlantillasPage() {
  return (
    <>
      <PageTitle title="Plantillas de Notificación" />
      <PlantillaNotificacionTable />
    </>
  );
}
