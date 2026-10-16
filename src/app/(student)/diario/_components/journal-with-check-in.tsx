"use client";

import type { Mood } from "@/components/icons/mood-orb";
import { useHome } from "@/features/home/api/use-home";
import { JournalForm } from "@/features/journal/components/journal-form";

/** El Diario con la cara del check-in de hoy ya marcada (CU-06 → CU-01); viniendo de Inicio, ya está en caché. */
export function JournalWithCheckIn() {
  const { data: home } = useHome();
  return <JournalForm checkinMood={(home?.checkinMood ?? null) as Mood | null} />;
}
