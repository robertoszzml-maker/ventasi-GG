'use client';

import CurvaTalleForm from '@/components/forms/curva-talle-form';
import { PageTitle } from '@/components/ui/page-title';
import { useGetCurvaTalleByIdQuery } from '@/hooks/curvas-talle';
import React from 'react';

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const { data, isLoading } = useGetCurvaTalleByIdQuery(Number(id));

  if (isLoading) return <>Cargando...</>;

  return (
    <>
      <PageTitle title="Editar Curva de Talle" />
      <CurvaTalleForm defaultValues={data} />
    </>
  );
}
