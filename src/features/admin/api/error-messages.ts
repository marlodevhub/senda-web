/**
 * Propio de admin, separado de {@code lib/api/error-messages.ts}: varios
 * códigos del backend (p. ej. ACCOUNT_LOCKED, TOO_MANY_ATTEMPTS) existen
 * tanto en AccessErrorCode como en AdminErrorCode con el mismo texto de
 * código pero mensajes distintos — mezclarlos en una sola tabla
 * compartida pisaría uno de los dos significados.
 */
const ADMIN_CODE_TO_MESSAGE_KEY: Record<string, string> = {
  LOGIN_ERROR: "admin.loginError",
  TOTP_ERROR: "admin.totpError",
  ACCOUNT_LOCKED: "admin.locked",
  TOO_MANY_ATTEMPTS: "admin.tooManyAttempts",
  CHALLENGE_EXPIRED: "admin.challengeExpired",
  INVALID_START_DATE: "admin.invalidStartDate",
  COHORT_CLOSED: "admin.cohortClosed",
  COHORT_NOT_EDITABLE: "admin.cohortNotEditable",
  COHORT_CANNOT_CLOSE_YET: "admin.cohortCannotCloseYet",
  COHORT_NOT_FOUND: "admin.cohortNotFound",
  RESET_NOT_ALLOWED: "admin.resetNotAllowed",
  UNAUTHENTICATED: "admin.sessionExpired",
  INVITATIONS_DISABLED: "admin.invite.disabled",
  INVITATION_INVALID: "admin.invite.invalid",
  ADMIN_EMAIL_TAKEN: "admin.invite.emailTaken",
  WEAK_ADMIN_PASSWORD: "admin.invite.weakPassword",
  ENROLLMENT_NOT_STARTED: "admin.invite.notStarted",
};

export function adminErrorMessageKey(code: string): string {
  return ADMIN_CODE_TO_MESSAGE_KEY[code] ?? "common.unexpectedError";
}
