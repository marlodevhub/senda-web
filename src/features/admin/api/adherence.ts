import { callBff } from "@/lib/api/client";

export type WeeklyAdherence = {
  week: number;
  participantsWithEntry: number;
  percentMetGoal: number;
  entries: number;
  rewrites: number;
};

export type AdherenceDashboard = {
  pendingCount: number;
  activeCount: number;
  readOnlyCount: number;
  withdrawnCount: number;
  weeks: WeeklyAdherence[];
};

export async function getAdherence(cohortId: number): Promise<AdherenceDashboard> {
  return callBff<AdherenceDashboard>(`/api/admin/v1/adherence?cohortId=${cohortId}`);
}

export function exportUrl(cohortId: number): string {
  return `/api/admin/v1/exports/adherence?cohortId=${cohortId}`;
}
