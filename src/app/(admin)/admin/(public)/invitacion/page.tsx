import { notFound } from "next/navigation";
import { adminInvitesEnabled } from "@/config/admin-flags";
import { AdminEnrollmentFlow } from "@/features/admin/components/admin-enrollment-flow";

/** CU-28: crear la cuenta de administrador con un código de invitación (solo donde las invitaciones están encendidas). */
export default function AdminInvitationPage() {
  if (!adminInvitesEnabled()) {
    notFound();
  }
  return <AdminEnrollmentFlow />;
}
