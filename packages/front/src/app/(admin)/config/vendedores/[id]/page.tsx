'use client'

import VendedorForm from "@/components/forms/vendedor-form"
import { PageTitle } from "@/components/ui/page-title"
import { useGetVendedorByIdQuery } from '@/hooks/vendedor'
import React from 'react'

export default function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = React.use(params)
    const { data, isLoading, isFetching } = useGetVendedorByIdQuery(parseInt(id))
    if (isLoading || isFetching) return <>Cargando...</>
    return (
        <>
            <PageTitle title="Editar Vendedor" />
            <VendedorForm data={data} />
        </>
    )
}
