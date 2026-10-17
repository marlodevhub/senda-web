import { History, Home, NotebookPen, Sprout, User } from "lucide-react";

export type StudentNavItem = { href: string; labelKey: string; icon: typeof Home };

/**
 * Navegación del estudiante (sección 2 de Senda/CLAUDE.md): las mismas 5
 * pestañas en la barra inferior (móvil) y en la barra lateral (tablet y
 * escritorio). "Mensajes para ti" tiene su propio botón arriba a la derecha.
 */
export const STUDENT_NAV_ITEMS: StudentNavItem[] = [
  { href: "/inicio", labelKey: "nav.home", icon: Home },
  { href: "/diario", labelKey: "nav.journal", icon: NotebookPen },
  { href: "/progreso", labelKey: "nav.progress", icon: Sprout },
  { href: "/historial", labelKey: "nav.history", icon: History },
  { href: "/perfil", labelKey: "nav.profile", icon: User },
];

