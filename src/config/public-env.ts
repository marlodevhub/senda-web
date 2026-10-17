/**
 * Configuración pública (llega al navegador). Solo valores que no son secretos: el client ID de Google es público por
 * diseño (Google lo muestra en su botón). Vacío = el ingreso con Google está apagado y no se muestra.
 */
export const GOOGLE_CLIENT_ID = (process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "").trim();

export const isGoogleSignInEnabled = GOOGLE_CLIENT_ID.length > 0;
