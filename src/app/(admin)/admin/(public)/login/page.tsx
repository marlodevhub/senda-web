import { getTranslations } from "next-intl/server";
import { AdminLoginForm } from "@/features/admin/components/admin-login-form";

export default async function AdminLoginPage() {
  const t = await getTranslations();

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1 text-center">
        <h2 className="font-heading text-lg font-semibold text-foreground">{t("admin.loginTitle")}</h2>
        <p className="text-sm text-muted-foreground">{t("admin.loginSubtitle")}</p>
      </div>
      <AdminLoginForm />
    </div>
  );
}
