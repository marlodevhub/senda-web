import "server-only";

/**
 * CU-28: invitar administradores con un código (RN-AD-11). Mismo ADMIN_INVITES_ENABLED que senda-api: encendido solo
 * en staging/QA. Se lee al ejecutar (no al construir), así la misma imagen sirve en cualquier entorno.
 */
export function adminInvitesEnabled(): boolean {
  return process.env.ADMIN_INVITES_ENABLED?.trim().toLowerCase() === "true";
}
