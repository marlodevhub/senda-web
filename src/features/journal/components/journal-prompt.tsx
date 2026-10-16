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
    // Preguntas en el rojo de la paleta (--prompt-red); el campo no tiene borde ni fondo, el foco lo marca el cursor.
    <div className="group flex flex-col gap-1 py-2">
      <label htmlFor={id} className="font-hand text-2xl leading-tight font-medium text-(--prompt-red)">
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
