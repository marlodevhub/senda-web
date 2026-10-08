import { callBff } from "@/lib/api/client";

export type MessageRule = "R2" | "R3" | "R4" | "R5" | "R6" | "R7";
export type MessageActionType = "NONE" | "WRITE" | "REWRITE" | "JAR_PHRASE";

export type Message = {
  id: number;
  rule: MessageRule;
  dimension: string | null;
  text: string;
  actionType: MessageActionType;
  actionJournalEntryId: number | null;
  actionFindingId: number | null;
  opened: boolean;
  createdAt: string;
};

export async function getMessages(): Promise<Message[]> {
  return callBff<Message[]>("/api/v1/messages");
}
