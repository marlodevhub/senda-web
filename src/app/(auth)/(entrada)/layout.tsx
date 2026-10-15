import { Sprout } from "lucide-react";
import { AuthCompanions } from "@/app/(auth)/(entrada)/_components/auth-companions";
import { SendaLandscape } from "@/app/(auth)/(entrada)/_components/senda-landscape";

/**
 * Entrada del estudiante (login, activar, recuperar): el paisaje de la senda
 * cubre el fondo y el formulario va encima, en una tarjeta de vidrio; en
 * escritorio, a la izquierda, con caras de ánimo y frases sobre el paisaje.
 */
export default function EntradaLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="senda-landscape relative isolate min-h-dvh overflow-hidden">
      <SendaLandscape />
      <div className="relative grid min-h-dvh lg:grid-cols-[minmax(0,34rem)_minmax(0,1fr)]">
        <main className="flex flex-col gap-6 p-4 sm:p-8 lg:p-10">
          <p className="flex items-center gap-2 font-heading text-2xl font-extrabold text-foreground">
            <span className="flex size-10 items-center justify-center rounded-full bg-card text-sprout-ink shadow-card">
              <Sprout className="size-5" aria-hidden />
            </span>
            Senda
          </p>
          <div className="flex flex-1 items-center justify-center pb-24 lg:pb-0">
            <div className="w-full max-w-md rounded-[2rem] bg-card/85 p-6 shadow-card backdrop-blur-xl sm:p-10">
              {children}
            </div>
          </div>
        </main>
        <AuthCompanions className="hidden lg:block" />
      </div>
    </div>
  );
}
