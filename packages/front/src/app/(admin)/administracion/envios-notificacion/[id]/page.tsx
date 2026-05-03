'use client'

import React from 'react'
import { PageTitle } from "@/components/ui/page-title"
import { useGetEnvioNotificacionByIdQuery } from '@/hooks/envio-notificacion'
import { EnvioNotificacionDetail } from '@/components/features/envio-notificacion-detail'

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params)
  const { data, isLoading, isFetching } = useGetEnvioNotificacionByIdQuery(Number(id))

  if (isLoading || isFetching) return <>Cargando...</>
  if (!data) return <>No encontrado</>

  return (
    <>
      <PageTitle title={`Envío #${data.id}`} />
      <EnvioNotificacionDetail data={data} />
    </>
  )
}
