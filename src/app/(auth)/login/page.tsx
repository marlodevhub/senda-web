import { getTranslations } from "next-intl/server";
import { LoginForm } from "@/features/access/components/login-form";

export default async function LoginPage() {
  const t = await getTranslations();

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1 text-center">
        <h2 className="font-heading text-lg font-semibold text-foreground">{t("access.loginTitle")}</h2>
        <p className="text-sm text-muted-foreground">{t("access.loginSubtitle")}</p>
      </div>
      <LoginForm />
    </div>
  );
}
