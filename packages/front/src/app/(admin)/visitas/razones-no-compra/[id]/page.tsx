'use client';

import RazonNoCompraForm from '@/components/forms/razon-no-compra-form';
import { PageTitle } from '@/components/ui/page-title';
import { useGetRazonByIdQuery } from '@/hooks/razon-no-compra';
import React from 'react';

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const { data, isLoading } = useGetRazonByIdQuery(Number(id));

  if (isLoading) return <>Cargando...</>;
  if (!data) return <>No encontrado</>;

  return (
    <>
      <PageTitle title="Editar razón de no compra" />
      <RazonNoCompraForm defaultValues={data} />
    </>
  );
}
