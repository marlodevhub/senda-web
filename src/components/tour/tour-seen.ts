const TOUR_SEEN_KEY = "senda:tour-seen";

/**
 * Si el tutorial ya se vio en este navegador. No es un dato del estudiante
 * (no se borra al cerrar sesión): solo evita mostrarlo solo otra vez. Si el
 * almacenamiento no está disponible, se da por visto para no insistir; desde
 * Perfil se puede abrir igual.
 */
export function isTourSeen(): boolean {
  try {
    return window.localStorage.getItem(TOUR_SEEN_KEY) === "1";
  } catch {
    return true;
  }
}

export function markTourSeen(): void {
  try {
    window.localStorage.setItem(TOUR_SEEN_KEY, "1");
  } catch {
    // Sin almacenamiento: se volverá a ofrecer, nada más.
  }
}

/** Al terminar la bienvenida (CU-17) el tutorial vuelve a abrirse solo en Inicio, aunque este navegador ya lo mostró. */
export function resetTourSeen(): void {
  try {
    window.localStorage.removeItem(TOUR_SEEN_KEY);
  } catch {
    // Sin almacenamiento: isTourSeen lo da por visto; se abre desde Perfil.
  }
}
