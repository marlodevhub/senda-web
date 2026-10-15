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
    // Preguntas en el rojo de la paleta. El campo no tiene borde ni cambia de fondo: el foco se ve en la pregunta,
    // que se subraya (WCAG 2.4.7).
    <div className="group flex flex-col gap-1 py-2">
      <label
        htmlFor={id}
        className="font-hand text-2xl leading-tight font-medium text-bloom-ink decoration-bloom/60 decoration-2 underline-offset-6 group-focus-within:underline"
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
        "field-sizing-content w-full resize-none bg-transparent font-hand text-xl leading-relaxed text-foreground outline-none placeholder:text-muted-foreground/80",
        className,
      )}
      {...props}
    />
  );
}
