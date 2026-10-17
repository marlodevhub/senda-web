import { redirect } from "next/navigation";

/**
 * El Espejo (CU-03) es siempre de un registro: `/espejo/{id}`. Sin registro no hay nada que mostrar, así que se va
 * al Historial, donde se elige uno.
 */
export default function EspejoSinRegistroPage() {
  redirect("/historial");
}
