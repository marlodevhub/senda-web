import { getTranslations } from "next-intl/server";
import { MessageInbox } from "@/features/guidance/components/message-inbox";
import { BackLink } from "@/components/layout/back-link";

export default async function MensajesPage() {
  const t = await getTranslations();

  return (
    <div className="flex flex-col gap-5">
      <BackLink href="/inicio" preferHistory />
      <h1 className="font-heading text-xl font-bold text-foreground">{t("guidance.title")}</h1>
      <MessageInbox />
    </div>
  );
}
