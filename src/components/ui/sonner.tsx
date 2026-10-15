"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react";
import { useMediaQuery } from "@/hooks/use-media-query";

/**
 * Abajo, por encima del dock flotante del estudiante, que existe por debajo de `md` (768 px). Sonner solo
 * distingue "móvil" hasta 600 px, así que el espacio se decide aquí con el mismo corte que el dock.
 */
const ABOVE_DOCK = "calc(6rem + env(safe-area-inset-bottom))";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();
  const hasDock = !useMediaQuery("(min-width: 768px)");
  const bottom = hasDock ? ABOVE_DOCK : "24px";

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      offset={{ bottom, right: "24px" }}
      mobileOffset={{ bottom, left: "16px", right: "16px" }}
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "cn-toast",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
