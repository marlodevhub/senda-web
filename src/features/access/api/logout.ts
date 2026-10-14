import { clearLocalStudentData } from "@/lib/local-student-data";

export async function logout(): Promise<void> {
  clearLocalStudentData();
  await fetch("/api/auth/logout", { method: "POST" });
}
