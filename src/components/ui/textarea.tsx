import * as React from "react";
import { cn } from "@/lib/utils";

/** Igual que `Input`: relleno, sin borde, anillo del color del logo al escribir. */
function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-24 py-3",
        "w-full min-w-0 rounded-2xl border-0 bg-foreground/6 px-4 text-base text-foreground caret-(--prompt-red) transition-[background-color,box-shadow] duration-150 outline-none placeholder:text-muted-foreground hover:bg-foreground/8 focus-visible:bg-card focus-visible:ring-2 focus-visible:ring-(--prompt-red) disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:bg-destructive/8 aria-invalid:ring-2 aria-invalid:ring-destructive",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
