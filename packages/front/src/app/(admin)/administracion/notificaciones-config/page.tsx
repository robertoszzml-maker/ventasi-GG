import NotificacionesForm from "@/components/forms/config/notificaciones-form";
import { PageTitle } from "@/components/ui/page-title";

export default function NotificacionesConfigPage() {
  return (
    <>
      <PageTitle title="Configuración de Notificaciones" />
      <NotificacionesForm />
    </>
  );
}
