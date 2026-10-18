import { adminInvitesEnabled } from "@/config/admin-flags";
import { AdminShell } from "./_components/admin-shell";

// CU-24 a CU-28: pantallas protegidas por proxy.ts (cookie senda_admin_access).
export default function AdminProtectedLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell invitationsEnabled={adminInvitesEnabled()}>{children}</AdminShell>;
}
