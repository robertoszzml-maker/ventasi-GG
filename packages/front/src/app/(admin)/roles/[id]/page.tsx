"use client";

import { useGetRoleByIdQuery } from "@/hooks/role";
import RoleForm from "@/components/forms/role-form";
import { PageTitle } from "@/components/ui/page-title";
import React from "react";

interface RolePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function RolePage({ params }: RolePageProps) {
  const { id } = React.use(params);
  const roleId = parseInt(id);
  const { data: role, isLoading, error } = useGetRoleByIdQuery(roleId);

  if (isLoading) {
    return <div>Cargando...</div>;
  }

  if (error || !role) {
    return <div>Error al cargar el rol</div>;
  }

  return (
    <>
      <PageTitle title="Editar Rol" />
      <RoleForm data={role} />
    </>
  );
}
