'use client';

import FamiliaForm from '@/components/forms/familia-form';
import { PageTitle } from '@/components/ui/page-title';
import { useGetFamiliaByIdQuery } from '@/hooks/familias';
import React from 'react';

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const { data, isLoading } = useGetFamiliaByIdQuery(Number(id));

  if (isLoading) return <>Cargando...</>;

  return (
    <>
      <PageTitle title="Editar Familia" />
      <FamiliaForm defaultValues={data} />
    </>
  );
}
