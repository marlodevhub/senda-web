import { callBff } from "@/lib/api/client";

export type Cohort = {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  status: "PLANNED" | "IN_PROGRESS" | "CLOSED";
  pendingCount: number;
  activeCount: number;
  readOnlyCount: number;
  withdrawnCount: number;
};

export async function getCohorts(): Promise<Cohort[]> {
  return callBff<Cohort[]>("/api/admin/v1/cohorts");
}

export async function createCohort(input: { name: string; startDate: string }): Promise<Cohort> {
  return callBff<Cohort>("/api/admin/v1/cohorts", { method: "POST", body: JSON.stringify(input) });
}

export async function closeCohort(cohortId: number): Promise<Cohort> {
  return callBff<Cohort>(`/api/admin/v1/cohorts/${cohortId}/close`, { method: "POST" });
}

export async function generateCodes(cohortId: number, count: number): Promise<string[]> {
  return callBff<string[]>(`/api/admin/v1/cohorts/${cohortId}/codes`, {
    method: "POST",
    body: JSON.stringify({ count }),
  });
}
