import { callBff } from "@/lib/api/client";

export type AdminParticipant = {
  code: string;
  status: string;
  daysWithEntry: number;
  lastActivityAt: string | null;
  weeklyGoalMet: boolean[];
};

export async function getParticipants(cohortId: number): Promise<AdminParticipant[]> {
  return callBff<AdminParticipant[]>(`/api/admin/v1/participants?cohortId=${cohortId}`);
}

export async function resetAccess(code: string): Promise<{ resetCode: string }> {
  return callBff<{ resetCode: string }>(`/api/admin/v1/participants/${code}/access-reset`, { method: "POST" });
}
