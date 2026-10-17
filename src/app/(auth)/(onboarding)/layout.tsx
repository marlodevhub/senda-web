import { ParticipantNoSelect } from "@/components/layout/participant-no-select";

/**
 * Consentimiento (CU-16) y bienvenida (CU-17), después de activar. Cada pantalla arma su propio marco: el
 * consentimiento, una tarjeta ancha para leer cómodo; la bienvenida, un carrusel a pantalla completa.
 */
export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="participant-no-select flex min-h-screen flex-col items-center justify-center bg-grad-dawn-soft px-4 py-8 md:py-12">
      <ParticipantNoSelect />
      {children}
    </div>
  );
}
