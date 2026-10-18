"use client";

import { useRouter } from "next/navigation";
import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { adminLogout } from "@/features/admin/api/login";

/** El panel con su barra lateral; "Invitaciones" (CU-28) solo donde están encendidas. */
export function AdminShell({
  invitationsEnabled,
  children,
}: {
  invitationsEnabled: boolean;
  children: React.ReactNode;
}) {
  const router = useRouter();

  async function handleLogout() {
    await adminLogout();
    router.push("/admin/login");
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar onLogout={handleLogout} invitationsEnabled={invitationsEnabled} />
      <main className="flex-1 overflow-x-hidden px-6 py-6">
        <div className="mx-auto w-full max-w-4xl">{children}</div>
      </main>
    </div>
  );
}
