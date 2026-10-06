/** RN-DI-05. Compartido porque lo usan `journal` (al escribir) y `progress` (gráfico "Dónde aparece"). */
export const JOURNAL_CONTEXTS = ["STUDIES", "FAMILY", "FRIENDS_OR_PARTNER", "BODY", "WORK", "OTHER"] as const;

export type JournalContext = (typeof JOURNAL_CONTEXTS)[number];

export const JOURNAL_CONTEXT_LABEL_KEY: Record<JournalContext, string> = {
  STUDIES: "journal.contextStudies",
  FAMILY: "journal.contextFamily",
  FRIENDS_OR_PARTNER: "journal.contextFriendsOrPartner",
  BODY: "journal.contextBody",
  WORK: "journal.contextWork",
  OTHER: "journal.contextOther",
};
