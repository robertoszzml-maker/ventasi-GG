'use client';

import CurvaColorForm from '@/components/forms/curva-color-form';
import { PageTitle } from '@/components/ui/page-title';
import { useGetCurvaColorByIdQuery } from '@/hooks/curvas-color';
import React from 'react';

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const { data, isLoading } = useGetCurvaColorByIdQuery(Number(id));

  if (isLoading) return <>Cargando...</>;

  return (
    <>
      <PageTitle title="Editar Curva de Color" />
      <CurvaColorForm defaultValues={data} />
    </>
  );
}
