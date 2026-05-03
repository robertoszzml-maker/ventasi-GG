import { ProveedoresTable } from "@/components/tables/proveedores-table"
import { PageTitle } from "@/components/ui/page-title"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function ProveedoresPage() {
    return <>
        <PageTitle title="Proveedores">
            <Link href="/proveedores/crear">
                <Button>Nuevo proveedor</Button>
            </Link>
        </PageTitle>
        <ProveedoresTable />
    </>
}
