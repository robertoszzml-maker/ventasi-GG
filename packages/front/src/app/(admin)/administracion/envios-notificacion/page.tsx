import EnvioNotificacionTable from "@/components/tables/envio-notificacion-table";
import { PageTitle } from "@/components/ui/page-title";

export default function EnviosNotificacionPage() {
  return (
    <>
      <PageTitle title="Historial de Notificaciones" />
      <EnvioNotificacionTable />
    </>
  );
}
