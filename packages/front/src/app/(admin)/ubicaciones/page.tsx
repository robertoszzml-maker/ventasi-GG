import { UbicacionesTable } from "@/components/tables/ubicaciones-table"
import { PageTitle } from "@/components/ui/page-title"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function UbicacionesPage() {
    return <>
        <PageTitle title="Ubicaciones">
            <Link href="/ubicaciones/crear">
                <Button>Nueva ubicación</Button>
            </Link>
        </PageTitle>
        <UbicacionesTable />
    </>
}
