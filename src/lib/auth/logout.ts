import { clearLocalStudentData } from "@/lib/local-student-data";

/** Se emite al cerrar sesión: `Providers` borra la caché de consultas (nada del estudiante queda en memoria). */
export const LOGOUT_EVENT = "senda:logout";

export async function logout(): Promise<void> {
  clearLocalStudentData();
  window.dispatchEvent(new Event(LOGOUT_EVENT));
  await fetch("/api/auth/logout", { method: "POST" });
}
