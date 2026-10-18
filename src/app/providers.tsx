"use client";

import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LOGOUT_EVENT } from "@/lib/auth/logout";

/**
 * Un QueryClient por sesión de navegador (no por render) para que el caché
 * de TanStack Query sobreviva a la navegación entre pantallas — el Espejo
 * consulta cada pocos segundos mientras el análisis está PENDIENTE.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  // 30 s sin volver a pedir lo mismo al cambiar de pantalla (lo que el estudiante cambia invalida su consulta al guardar).
  const [queryClient] = useState(() => new QueryClient({ defaultOptions: { queries: { staleTime: 30_000 } } }));

  // Al cerrar sesión se borra todo lo cargado: otra persona en el mismo teléfono no ve nada del anterior.
  useEffect(() => {
    const clear = () => queryClient.clear();
    window.addEventListener(LOGOUT_EVENT, clear);
    return () => window.removeEventListener(LOGOUT_EVENT, clear);
  }, [queryClient]);

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
