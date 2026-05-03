"use client";

import { PlantillaNotificacionForm } from "@/components/forms/plantilla-notificacion-form";
import { PageTitle } from "@/components/ui/page-title";
import { useGetPlantillaNotificacionByIdQuery } from "@/hooks/plantilla-notificacion";
import React from "react";
export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const { data, isLoading, isFetching } = useGetPlantillaNotificacionByIdQuery(
    Number(id)
  );
  if (isLoading || isFetching) return <>Cargando...</>;
  return (
    <>
      <PageTitle title="Editar Plantilla" />
      <PlantillaNotificacionForm data={data} />
    </>
  );
}
