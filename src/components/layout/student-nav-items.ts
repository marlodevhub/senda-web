import { History, Home, Mail, NotebookPen, Sprout, User } from "lucide-react";

export type StudentNavItem = { href: string; labelKey: string; icon: typeof Home };

/**
 * Navegación del estudiante (sección 2 de Senda/CLAUDE.md): las 5 pestañas
 * de la barra inferior en móvil. En escritorio la barra lateral suma
 * Mensajes, que en móvil se abre desde el aviso de Inicio.
 */
export const STUDENT_NAV_ITEMS: StudentNavItem[] = [
  { href: "/inicio", labelKey: "nav.home", icon: Home },
  { href: "/diario", labelKey: "nav.journal", icon: NotebookPen },
  { href: "/progreso", labelKey: "nav.progress", icon: Sprout },
  { href: "/historial", labelKey: "nav.history", icon: History },
  { href: "/perfil", labelKey: "nav.profile", icon: User },
];

export const MESSAGES_NAV_ITEM: StudentNavItem = { href: "/mensajes", labelKey: "nav.messages", icon: Mail };
