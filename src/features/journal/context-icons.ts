import { BookOpen, Briefcase, Heart, House, PersonStanding, Sparkles, Users, type LucideIcon } from "lucide-react";
import type { JournalContext } from "@/types/journal-context";

/** RN-DI-05: el ícono y el color de cada contexto (al escribir, en el historial y en sus filtros). */
export const CONTEXT_ICONS: Record<JournalContext, { icon: LucideIcon; tone: string }> = {
  STUDIES: { icon: BookOpen, tone: "text-flow-ink bg-flow-tint" },
  FAMILY: { icon: House, tone: "text-root-ink bg-root-tint" },
  FRIENDS: { icon: Users, tone: "text-flow-ink bg-flow-tint" },
  PARTNER: { icon: Heart, tone: "text-bloom-ink bg-bloom-tint" },
  BODY: { icon: PersonStanding, tone: "text-root-ink bg-root-tint" },
  WORK: { icon: Briefcase, tone: "text-sprout-ink bg-sprout-tint" },
  OTHER: { icon: Sparkles, tone: "text-flow-ink bg-flow-tint" },
};
