/**
 * Formato de fechas de la app (RS-TR: toda fecha se muestra en hora de
 * Lima, America/Lima, nunca en la del navegador). Un solo lugar para que
 * todas las pantallas escriban las fechas igual.
 */
const LIMA = "America/Lima";
const LOCALE = "es-PE";

const shortDate = new Intl.DateTimeFormat(LOCALE, { timeZone: LIMA, day: "numeric", month: "short" });
const numericDate = new Intl.DateTimeFormat(LOCALE, { timeZone: LIMA, dateStyle: "short" });
const dateTime = new Intl.DateTimeFormat(LOCALE, { timeZone: LIMA, dateStyle: "short", timeStyle: "short" });
// Una fecha sin hora (p. ej. "2026-10-14") ya es un día de Lima: se formatea sin moverla de zona.
const calendarDay = new Intl.DateTimeFormat(LOCALE, { timeZone: "UTC", day: "numeric", month: "long" });
const isoDay = new Intl.DateTimeFormat("en-CA", { timeZone: LIMA });

/** Un instante ISO como "14 oct". */
export function formatShortDate(instant: string): string {
  return shortDate.format(new Date(instant));
}

/** Un instante ISO como "14/10/26". */
export function formatNumericDate(instant: string): string {
  return numericDate.format(new Date(instant));
}

/** Un instante ISO como "14/10/26, 3:05 p. m.". */
export function formatDateTime(instant: string): string {
  return dateTime.format(new Date(instant));
}

/** Un día de calendario ("2026-10-14") como "14 de octubre". */
export function formatCalendarDay(isoDate: string): string {
  return calendarDay.format(new Date(`${isoDate}T00:00:00Z`));
}

/** El día de hoy en Lima como "2026-10-14", desplazado `offsetDays`. */
export function limaIsoDay(offsetDays = 0): string {
  return isoDay.format(new Date(Date.now() + offsetDays * 24 * 60 * 60 * 1000));
}

/**
 * Un día de calendario ("2026-10-16", ya es un día de Lima) con el formato pedido, sin correrlo por la zona del
 * navegador: "vie, 16 oct." (`short`) o "viernes, 16 de octubre" (`long`).
 */
export function formatIsoDay(isoDate: string, options: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat(LOCALE, { ...options, timeZone: "UTC" }).format(new Date(`${isoDate}T00:00:00Z`));
}

/** Hoy en Lima con el formato pedido (p. ej. "viernes, 16 de octubre"). */
export function formatTodayLima(options: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat(LOCALE, { ...options, timeZone: LIMA }).format(new Date());
}

/** Una fecha local del navegador (p. ej. la celda del calendario) como "viernes, 16 de octubre". */
export function formatLocalDate(date: Date, options: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat(LOCALE, options).format(date);
}
