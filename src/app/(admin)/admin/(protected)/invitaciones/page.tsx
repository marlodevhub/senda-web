import { notFound } from "next/navigation";
import { adminInvitesEnabled } from "@/config/admin-flags";
import { AdminInvitationsView } from "@/features/admin/components/admin-invitations-view";

/** CU-28 Invitar a otro administrador (solo donde las invitaciones están encendidas). */
export default function AdminInvitationsPage() {
  if (!adminInvitesEnabled()) {
    notFound();
  }
  return <AdminInvitationsView />;
}
