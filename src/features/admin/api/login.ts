import { callBff } from "@/lib/api/client";

export async function adminLogin(input: { email: string; password: string }): Promise<void> {
  await callBff<void>("/api/admin-auth/login", { method: "POST", body: JSON.stringify(input) });
}

export async function adminVerify(code: string): Promise<void> {
  await callBff<void>("/api/admin-auth/verify", { method: "POST", body: JSON.stringify({ code }) });
}

export async function adminLogout(): Promise<void> {
  await fetch("/api/admin-auth/logout", { method: "POST" });
}
