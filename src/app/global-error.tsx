"use client";

import messages from "../../messages/es.json";

/**
 * Último recurso si falla el propio layout raíz: aquí no hay proveedores
 * (ni next-intl ni el tema), así que los textos se leen del mismo catálogo.
 */
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="es">
      <body style={{ fontFamily: "system-ui, sans-serif", background: "#F2F4EA", color: "#2B2430", margin: 0 }}>
        <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: "1rem", textAlign: "center" }}>
          <div>
            <h1 style={{ fontSize: "1.5rem" }}>{messages.errors.unexpectedTitle}</h1>
            <p style={{ fontSize: "1rem" }}>{messages.errors.unexpectedBody}</p>
            <button
              type="button"
              onClick={reset}
              style={{ fontSize: "1rem", padding: "0.75rem 1.5rem", borderRadius: "999px", border: "none", background: "#E8738A", color: "#2B1A20", cursor: "pointer" }}
            >
              {messages.errors.retry}
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
