'use client';

import SubgrupoForm from '@/components/forms/subgrupo-form';
import { PageTitle } from '@/components/ui/page-title';
import { useGetSubgrupoByIdQuery } from '@/hooks/subgrupos';
import React from 'react';

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const { data, isLoading } = useGetSubgrupoByIdQuery(Number(id));

  if (isLoading) return <>Cargando...</>;

  return (
    <>
      <PageTitle title="Editar Subgrupo" />
      <SubgrupoForm defaultValues={data} />
    </>
  );
}
