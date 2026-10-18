import { callBff } from "@/lib/api/client";

export type AdminInvitationStatus = "PENDING" | "USED" | "EXPIRED";

export type AdminInvitation = {
  id: number;
  status: AdminInvitationStatus;
  createdBy: string | null;
  createdAt: string;
  expiresAt: string;
  usedBy: string | null;
  usedAt: string | null;
};

export type AdminInvitationCode = { code: string; expiresAt: string };

/** CU-28 paso 1: lo que necesita la app autenticadora. */
export type AdminEnrollment = { secret: string; otpAuthUri: string; qrPngBase64: string };

export async function getAdminInvitations(): Promise<AdminInvitation[]> {
  return callBff<AdminInvitation[]>("/api/admin/v1/invitations");
}

export async function createAdminInvitation(): Promise<AdminInvitationCode> {
  return callBff<AdminInvitationCode>("/api/admin/v1/invitations", { method: "POST" });
}

export async function startAdminEnrollment(input: {
  code: string;
  email: string;
  password: string;
}): Promise<AdminEnrollment> {
  return callBff<AdminEnrollment>("/api/admin-auth/invitation-start", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function confirmAdminEnrollment(input: { code: string; totpCode: string }): Promise<void> {
  await callBff<void>("/api/admin-auth/invitation-confirm", { method: "POST", body: JSON.stringify(input) });
}
