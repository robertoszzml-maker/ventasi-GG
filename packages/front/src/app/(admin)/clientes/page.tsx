import { ClientesTable } from "@/components/tables/clientes-table"
import { PageTitle } from "@/components/ui/page-title"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function ClientesPage() {
    return <>
        <PageTitle title="Clientes">
            <Link href="/clientes/crear">
                <Button>Nuevo cliente</Button>
            </Link>
        </PageTitle>
        <ClientesTable />
    </>
}
