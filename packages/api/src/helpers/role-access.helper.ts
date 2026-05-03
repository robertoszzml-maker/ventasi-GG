// src/common/utils/role-access.util.ts

import { getUser } from "./get-user";

export function hasAccess(rol: number): boolean {
    const user = getUser();  // Accede al req desde el contexto global
    if (!user) {
        return false;
    }
    return user.role === rol;  // Verifica si el rol del usuario coincide con el requerido
}