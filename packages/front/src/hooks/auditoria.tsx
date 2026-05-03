import { useQuery } from "@tanstack/react-query";
import { fetchPresupuestoHistorial } from "@/services/auditoria";

export const usePresupuestoHistorial = (presupuestoId: number) => {
  return useQuery({
    queryKey: ["presupuesto-historial", presupuestoId],
    queryFn: () => fetchPresupuestoHistorial(presupuestoId),
    enabled: !!presupuestoId,
  });
};
