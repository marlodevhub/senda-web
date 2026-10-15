/** Título de las pantallas de entrada; h1 de la página (el layout no lleva otro). */
export function AuthHeading({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="flex flex-col gap-2 text-center">
      <h1 className="font-heading text-4xl leading-tight font-extrabold text-foreground">{title}</h1>
      <p className="text-base text-muted-foreground">{subtitle}</p>
    </div>
  );
}
