'use client';

import EjemploForm from '@/components/forms/ejemplo-form';
import { PageTitle } from '@/components/ui/page-title';
import { useGetEjemploByIdQuery } from '@/hooks/ejemplos';
import React from 'react';

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const { data, isLoading } = useGetEjemploByIdQuery(Number(id));

  if (isLoading) return <>Cargando...</>;

  return (
    <>
      <PageTitle title="Editar Ejemplo" />
      <EjemploForm defaultValues={data} />
    </>
  );
}
