'use client';

import GrupoForm from '@/components/forms/grupo-form';
import { PageTitle } from '@/components/ui/page-title';
import { useGetGrupoByIdQuery } from '@/hooks/grupos';
import React from 'react';

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const { data, isLoading } = useGetGrupoByIdQuery(Number(id));

  if (isLoading) return <>Cargando...</>;

  return (
    <>
      <PageTitle title="Editar Grupo" />
      <GrupoForm defaultValues={data} />
    </>
  );
}
