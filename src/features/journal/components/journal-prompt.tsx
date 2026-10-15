import { FieldError } from "@/components/forms/field-error";
import { cn } from "@/lib/utils";

/** Una pregunta del diario: la pregunta y, debajo, el renglón para escribir, ambos en letra manuscrita. */
export function JournalPrompt({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    // El campo no tiene borde ni cambia de fondo: el foco se ve en la pregunta, que toma el color de acento.
    <div className="group flex flex-col gap-1 py-2">
      <label
        htmlFor={id}
        className="pe-10 font-hand text-3xl leading-tight text-foreground transition-colors group-focus-within:text-bloom-ink"
      >
        {label}
      </label>
      {children}
      <FieldError message={error} />
    </div>
  );
}

export function JournalTextarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn(
        // Caveat se ve más chica que una letra normal: a 26 px se lee como unos 18 px de Figtree.
        "field-sizing-content w-full resize-none bg-transparent font-hand text-[1.625rem] leading-snug text-foreground outline-none placeholder:text-muted-foreground/80",
        className,
      )}
      {...props}
    />
  );
}
