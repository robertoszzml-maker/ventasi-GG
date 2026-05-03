'use client'

import ClienteForm from "@/components/forms/cliente-form"
import { PageTitle } from "@/components/ui/page-title"
import { useGetClienteByIdQuery } from '@/hooks/cliente'
import React from 'react'

export default function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = React.use(params);
    const { data, isLoading, isFetching } = useGetClienteByIdQuery(Number(id));
    if (isLoading || isFetching) return <>Cargando...</>
    return (
        <>
            <PageTitle title="Editar Cliente" />
            <ClienteForm data={data} />
        </>
    );
}
