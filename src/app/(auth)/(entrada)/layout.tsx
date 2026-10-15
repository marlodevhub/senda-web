import { Sprout } from "lucide-react";
import { AuthBanner, AuthShowcase } from "@/app/(auth)/(entrada)/_components/auth-showcase";

/**
 * Entrada del estudiante (login, activar, recuperar): el formulario a la
 * izquierda y el jardín ilustrado a la derecha; en móvil y tablet, el jardín
 * va en una franja sobre el formulario.
 */
export default function EntradaLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-card p-3 lg:p-4">
      <div className="mx-auto grid min-h-[calc(100dvh-1.5rem)] max-w-7xl gap-4 lg:min-h-[calc(100dvh-2rem)] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
        <main className="flex flex-col gap-6 px-2 pt-2 pb-8 sm:px-8 lg:px-12 lg:py-8">
          <p className="flex items-center gap-2 font-heading text-2xl font-extrabold text-foreground">
            <span className="flex size-10 items-center justify-center rounded-full bg-sprout-tint text-sprout-ink">
              <Sprout className="size-5" aria-hidden />
            </span>
            Senda
          </p>
          <AuthBanner />
          <div className="flex flex-1 items-center justify-center">
            <div className="w-full max-w-sm">{children}</div>
          </div>
        </main>
        <AuthShowcase />
      </div>
    </div>
  );
}
