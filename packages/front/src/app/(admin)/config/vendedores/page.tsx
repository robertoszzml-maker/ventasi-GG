import VendedorTable from "@/components/tables/vendedores-table"
import { PageTitle } from "@/components/ui/page-title"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

export default function VendedoresPage() {
    return <>
        <div className="flex items-center justify-between">
            <PageTitle title="Vendedores" />
            <Button asChild size="sm">
                <Link href="/config/vendedores/crear">
                    <Plus className="h-4 w-4 mr-2" />
                    Nuevo vendedor
                </Link>
            </Button>
        </div>
        <VendedorTable />
    </>
}
