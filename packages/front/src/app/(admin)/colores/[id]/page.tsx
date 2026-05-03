'use client';

import ColorForm from '@/components/forms/color-form';
import { PageTitle } from '@/components/ui/page-title';
import { useGetColorByIdQuery } from '@/hooks/colores';
import React from 'react';

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const { data, isLoading } = useGetColorByIdQuery(Number(id));

  if (isLoading) return <>Cargando...</>;

  return (
    <>
      <PageTitle title="Editar Color" />
      <ColorForm defaultValues={data} />
    </>
  );
}
