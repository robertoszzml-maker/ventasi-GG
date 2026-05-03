'use client';

import CaracteristicaVisitanteForm from '@/components/forms/caracteristica-visitante-form';
import { PageTitle } from '@/components/ui/page-title';
import { useGetCaracteristicaByIdQuery } from '@/hooks/caracteristica-visitante';
import React from 'react';

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const { data, isLoading } = useGetCaracteristicaByIdQuery(Number(id));

  if (isLoading) return <>Cargando...</>;

  return (
    <>
      <PageTitle title="Editar característica de visitante" />
      <CaracteristicaVisitanteForm defaultValues={data} />
    </>
  );
}
