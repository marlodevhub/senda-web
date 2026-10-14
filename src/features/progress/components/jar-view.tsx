"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { cn } from "cn";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { JarCard } from "@/features/progress/api/jar";
import { useUpdateJarCard } from "@/features/progress/api/use-jar";
import { DIMENSION_COLOR } from "@/features/progress/dimension-style";

const DATE_FORMATTER = new Intl.DateTimeFormat("es-PE", { day: "numeric", month: "long", timeZone: "UTC" });

/**
 * CU-09: las frases que el estudiante guardó, favoritas primero (RN-PR-09,
 * el orden viene del backend). Quitar pide confirmar y la reescritura sigue
 * en el historial (3a). Presentacional salvo las 2 acciones de la tarjeta.
 */
export function JarView({ cards }: { cards: JarCard[] }) {
  const t = useTranslations();
  const updateCard = useUpdateJarCard();
  const [toRemove, setToRemove] = useState<JarCard | null>(null);

  async function change(card: JarCard, value: { favorite: boolean } | { inJar: false }) {
    try {
      await updateCard.mutateAsync({ rewriteId: card.rewriteId, change: value });
    } catch {
      toast.error(t("common.unexpectedError"));
    }
  }

  if (cards.length === 0) {
    return <p className="py-10 text-center text-sm text-muted-foreground">{t("progress.jar.empty")}</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {cards.map((card) => (
        <Card key={card.rewriteId} style={{ borderLeft: `4px solid ${DIMENSION_COLOR[card.dimension]}` }}>
          <CardContent className="flex flex-col gap-2">
            <div className="flex items-start justify-between gap-2">
              <p className="font-display text-base leading-snug text-foreground">{card.text}</p>
              <button
                type="button"
                aria-pressed={card.favorite}
                aria-label={card.favorite ? t("progress.jar.unfavorite") : t("progress.jar.favorite")}
                disabled={updateCard.isPending}
                onClick={() => change(card, { favorite: !card.favorite })}
                className="flex size-11 shrink-0 items-center justify-center rounded-full text-bloom focus-visible:outline-2 focus-visible:outline-ring"
              >
                <Star className={cn("size-5", card.favorite && "fill-current")} aria-hidden />
              </button>
            </div>
            <span className="text-xs text-muted-foreground">
              {DATE_FORMATTER.format(new Date(`${card.date}T00:00:00Z`))}
            </span>
            <details className="text-sm text-muted-foreground">
              <summary className="cursor-pointer py-1 font-semibold text-foreground">
                {t("progress.jar.showOrigin")}
              </summary>
              <p className="mt-1 before:content-['“'] after:content-['”']">{card.originalPhrase}</p>
            </details>
            <Button variant="ghost" size="sm" className="self-start" onClick={() => setToRemove(card)}>
              {t("progress.jar.remove")}
            </Button>
          </CardContent>
        </Card>
      ))}

      <Dialog open={toRemove !== null} onOpenChange={(open) => !open && setToRemove(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("progress.jar.removeConfirmTitle")}</DialogTitle>
            <DialogDescription>{t("progress.jar.removeConfirm")}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setToRemove(null)}>
              {t("common.cancel")}
            </Button>
            <Button
              disabled={updateCard.isPending}
              onClick={async () => {
                if (toRemove) {
                  await change(toRemove, { inJar: false });
                }
                setToRemove(null);
              }}
            >
              {t("progress.jar.remove")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
