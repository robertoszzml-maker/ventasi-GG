import { MovimientosTable } from "@/components/tables/movimientos-table"
import { PageTitle } from "@/components/ui/page-title"

export default function MovimientosPage() {
    return <>
        <PageTitle title="Movimientos de Inventario" />
        <MovimientosTable />
    </>
}
