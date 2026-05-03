import { getUser } from './get-user';
import { PermissionsService } from '@/modules/auth/permissions/permissions.service';

/**
 * Clase singleton para manejar la instancia del servicio de permisos
 */
class PermissionsHelper {
    private static instance: PermissionsService;

    static setService(service: PermissionsService) {
        this.instance = service;
    }

    static getService(): PermissionsService {
        if (!this.instance) {
            throw new Error('PermissionsService no ha sido inicializado. Asegúrate de llamar PermissionsHelper.setService() en el módulo.');
        }
        return this.instance;
    }
}

/**
 * Función helper para verificar permisos del usuario actual
 * 
 * @param permissionCodes - Array de códigos de permisos a verificar
 * @returns Promise<boolean> - true si el usuario tiene alguno de los permisos requeridos
 * 
 * @example
 * const canView = await hasPermissions([PERMISOS.PRESUPUESTOS_VER]);
 */
export const hasPermission = async (
    permision: string,
): Promise<boolean> => {
    const user = getUser();

    if (!user || !user.role) {
        return false;
    }
    const permissionsService = PermissionsHelper.getService();
    return await permissionsService.roleHasPermissions(user.role, [permision]);
};

// Exportar el helper para configuración
export { PermissionsHelper };
