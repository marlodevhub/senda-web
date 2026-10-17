"use client";

import { useSearchParams } from "next/navigation";
import type { Mood } from "@/components/icons/mood-orb";
import { useHome } from "@/features/home/api/use-home";
import { JournalForm } from "@/features/journal/components/journal-form";

/** `?animo=N` (1 a 5): la cara que se acaba de elegir en Inicio al tocar Escribir. */
function parseChosenMood(value: string | null): Mood | null {
  const mood = Number(value);
  return Number.isInteger(mood) && mood >= 1 && mood <= 5 ? (mood as Mood) : null;
}

/**
 * El Diario con la cara de hoy ya marcada (CU-06 → CU-01): la que se eligió al tocar Escribir en Inicio (viene en
 * la URL) o, si se entra de otra forma, la del check-in de hoy.
 */
export function JournalWithCheckIn() {
  const { data: home } = useHome();
  const chosenMood = parseChosenMood(useSearchParams().get("animo"));
  return <JournalForm checkinMood={(home?.checkinMood ?? null) as Mood | null} chosenMood={chosenMood} />;
}
