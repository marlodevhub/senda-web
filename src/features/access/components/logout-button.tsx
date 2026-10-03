"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { logout } from "@/features/access/api/logout";

export function LogoutButton() {
  const t = useTranslations();
  const router = useRouter();

  async function handleClick() {
    await logout();
    router.push("/login");
  }

  return (
    <Button type="button" variant="ghost" onClick={handleClick}>
      {t("access.logout")}
    </Button>
  );
}
