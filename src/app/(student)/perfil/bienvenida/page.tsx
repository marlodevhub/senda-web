import { WelcomeFlow } from "@/features/welcome/components/welcome-flow";

/** RN-AC-13: repasar la bienvenida desde Perfil, sin volver a pasar por la pregunta inicial. */
export default function RepasoBienvenidaPage() {
  return <WelcomeFlow mode="review" />;
}
