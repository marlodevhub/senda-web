import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Campo relleno, como en una app nativa (iOS y el "filled" de Material 3): fondo tintado sin borde, 48 px de alto y,
 * al escribir, se aclara con un anillo del color del logo (que también tiñe el cursor). Translúcido, así se ve sobre
 * el fondo, una tarjeta blanca o una gris; sobre un color (la bienvenida) se pasa `bg-card`.
 */
function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-12 file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
        "w-full min-w-0 rounded-2xl border-0 bg-foreground/6 px-4 text-base text-foreground caret-(--prompt-red) transition-[background-color,box-shadow] duration-150 outline-none placeholder:text-muted-foreground hover:bg-foreground/8 focus-visible:bg-card focus-visible:ring-2 focus-visible:ring-(--prompt-red) disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:bg-destructive/8 aria-invalid:ring-2 aria-invalid:ring-destructive",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
