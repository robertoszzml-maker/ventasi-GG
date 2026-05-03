import { UsuariosTable } from "@/components/tables/usuario-table";
import { PageTitle } from "@/components/ui/page-title";

export default function Areas() {
  return (
    <>
      <PageTitle title="Usuarios" />
      <UsuariosTable />
    </>
  );
}
