'use client';

import TalleForm from '@/components/forms/talle-form';
import { PageTitle } from '@/components/ui/page-title';
import { useGetTalleByIdQuery } from '@/hooks/talles';
import React from 'react';

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const { data, isLoading } = useGetTalleByIdQuery(Number(id));

  if (isLoading) return <>Cargando...</>;

  return (
    <>
      <PageTitle title="Editar Talle" />
      <TalleForm defaultValues={data} />
    </>
  );
}
