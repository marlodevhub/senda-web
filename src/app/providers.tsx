"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

/**
 * Un QueryClient por sesión de navegador (no por render) para que el caché
 * de TanStack Query sobreviva a la navegación entre pantallas — el Espejo
 * consulta cada pocos segundos mientras el análisis está PENDIENTE.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
