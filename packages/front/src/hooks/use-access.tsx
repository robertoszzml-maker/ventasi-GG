import { useStore } from "@/lib/store";

function hasAccess(allowedRoles: number[]): boolean {
  const user = useStore((state) => state.user);

  if (!user || !user.role) return false;
  return allowedRoles.includes(user.role);
}

function notHasAccess(deniedRoles: number[]): boolean {
  const user = useStore((state) => state.user);

  if (!user || !user.role) return true;
  return !deniedRoles.includes(user.role);
}

function hasPermission(permissionCode: string): boolean {
  const permissions = useStore((state) => state.permissions);
  return permissions.some(
    (permission) => permission?.codigo === permissionCode
  );
}

export { hasAccess, notHasAccess, hasPermission };
