'use client'

import UbicacionForm from "@/components/forms/ubicacion-form"
import { PageTitle } from "@/components/ui/page-title"
import { useGetUbicacionByIdQuery } from '@/hooks/ubicacion'
import React from 'react'

export default function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = React.use(params);
    const { data, isLoading, isFetching } = useGetUbicacionByIdQuery(Number(id));
    if (isLoading || isFetching) return <>Cargando...</>
    return (
        <>
            <PageTitle title="Editar Ubicación" />
            <UbicacionForm data={data} />
        </>
    );
}
