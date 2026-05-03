import { RolesTable } from "@/components/tables/roles-table";
import { PageTitle } from "@/components/ui/page-title";

export default function RolesPage() {
  return (
    <>
      <PageTitle title="Roles" />
      <RolesTable />
    </>
  );
}
