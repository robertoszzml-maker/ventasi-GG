'use client'

import ProveedorForm from "@/components/forms/proveedor-form"
import { PageTitle } from "@/components/ui/page-title"
import { useGetProveedorByIdQuery } from '@/hooks/proveedor'
import React from 'react'

export default function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = React.use(params);
    const { data, isLoading, isFetching } = useGetProveedorByIdQuery(Number(id));
    if (isLoading || isFetching) return <>Cargando...</>
    return (
        <>
            <PageTitle title="Editar Proveedor" />
            <ProveedorForm data={data} />
        </>
    );
}
