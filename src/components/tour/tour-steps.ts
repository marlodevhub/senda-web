import type { Emotion } from "@/components/illustrations/emotion-characters";

const ALL: Emotion[] = ["calm", "sad", "joy", "spark", "hope", "nerves"];

export type TourStep = {
  /** Prefijo de sus claves i18n: `tour.{id}Title` y `tour.{id}Body`. */
  id: string;
  /** Quién habla: un personaje o, al abrir y al cerrar, todos. */
  cast: Emotion[];
  /** `data-tour` del elemento que se ilumina (pestaña o campana); sin él, la tarjeta va al centro. */
  target?: string;
  /** Muestra las 5 caras del check-in. */
  moods?: boolean;
};

/**
 * El recorrido sigue el orden de uso de la app (ciclo diario de Senda/CLAUDE.md
 * sección 12): Inicio → Diario → Espejo → Reescritura → Progreso, y después lo
 * que acompaña. Cada emoción guía el paso con el que más tiene que ver.
 */
export const TOUR_STEPS: TourStep[] = [
  { id: "welcome", cast: ALL },
  { id: "home", cast: ["calm"], target: "inicio", moods: true },
  { id: "journal", cast: ["hope"], target: "diario" },
  { id: "mirror", cast: ["nerves"] },
  { id: "rewrite", cast: ["spark"] },
  { id: "progress", cast: ["joy"], target: "progreso" },
  { id: "messages", cast: ["sad"], target: "mensajes" },
  { id: "history", cast: ["calm"], target: "historial" },
  { id: "profile", cast: ["hope"], target: "perfil" },
  { id: "done", cast: ALL },
];

export const SPEAKER_KEY: Record<Emotion, string> = {
  calm: "tour.speakerCalm",
  joy: "tour.speakerJoy",
  sad: "tour.speakerSad",
  spark: "tour.speakerSpark",
  hope: "tour.speakerHope",
  nerves: "tour.speakerNerves",
};
