'use client';

import EjemploCategoriaForm from '@/components/forms/ejemplo-categoria-form';
import { PageTitle } from '@/components/ui/page-title';
import { useGetEjemploCategoriaByIdQuery } from '@/hooks/ejemplo-categorias';
import React from 'react';

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const { data, isLoading } = useGetEjemploCategoriaByIdQuery(Number(id));

  if (isLoading) return <>Cargando...</>;

  return (
    <>
      <PageTitle title="Editar Categoría de Ejemplo" />
      <EjemploCategoriaForm defaultValues={data} />
    </>
  );
}
