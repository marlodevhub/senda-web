/**
 * Código de error de la API ({@code code} de RS-TR-06) → clave i18n.
 * Ver la tabla "Errores comunes a manejar en UI" en senda-web/CLAUDE.md.
 */
const CODE_TO_MESSAGE_KEY: Record<string, string> = {
  INVALID_CODE: "access.invalidCode",
  ACTIVATION_NOT_POSSIBLE: "access.invalidCode",
  TOO_MANY_ACTIVATION_ATTEMPTS: "access.tooManyAttempts",
  TOO_MANY_ATTEMPTS: "access.tooManyAttempts",
  WEAK_PASSWORD: "access.weakPassword",
  INVALID_CREDENTIALS: "access.invalidCredentials",
  ACCOUNT_LOCKED: "access.accountLocked",
  CONSENT_REQUIRED: "access.consentRequired",
  CONSENT_VERSION_MISMATCH: "consent.versionMismatch",
  INVALID_REFRESH_TOKEN: "access.sessionExpired",
  UNAUTHENTICATED: "access.sessionExpired",
  MISSING_MOOD: "journal.missingMood",
  ENTRY_TOO_SHORT: "journal.entryTooShort",
  MISSING_SECOND_QUESTION: "journal.missingSecondQuestion",
  TEXT_TOO_LONG: "journal.textTooLong",
  DAILY_LIMIT_REACHED: "journal.dailyLimitReached",
  READ_ONLY_PERIOD: "journal.readOnlyPeriod",
};

export function errorMessageKey(code: string): string {
  return CODE_TO_MESSAGE_KEY[code] ?? "common.unexpectedError";
}
