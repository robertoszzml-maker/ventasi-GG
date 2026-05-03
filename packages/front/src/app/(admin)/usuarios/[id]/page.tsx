'use client'

import UsuarioForm from "@/components/forms/usuario-form"
import { PageTitle } from "@/components/ui/page-title"
import { useGetUsuarioByIdQuery } from '@/hooks/usuario'
import React from 'react'

export default function Page({ params }: { params: Promise<{ id: number }> }) {
  const { id } = React.use(params);
  const { data, isLoading, isFetching } = useGetUsuarioByIdQuery(id);
  if (isLoading || isFetching) return <>Cargando...</>
  return (
    <>
      <PageTitle title="Editar Usuario" />
      <UsuarioForm data={data} />
    </>
  );
}
