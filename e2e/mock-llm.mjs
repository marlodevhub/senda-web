// LLM simulado para las pruebas E2E: imita la Messages API de Anthropic
// (POST /v1/messages) con respuestas fijas, para no gastar ni depender del
// proveedor real. Las posiciones de la frase van mal contadas a propósito:
// el backend debe ubicar la frase por su texto (FragmentLocator).
import http from "node:http";

const PORT = Number(process.env.MOCK_LLM_PORT ?? 4010);

const KNOWN_PHRASES = [
  ["Soy un inútil", "D1", "self_disqualification"],
  ["siempre la malogro", "D1", "error_overgeneralization"],
  ["merezco sentirme mal", "D1", "self_punishment"],
  ["no valgo nada", "D2", "worth_by_performance"],
  ["todos son mejores que yo", "D2", "social_comparison"],
  ["si no me aprueban", "D2", "need_for_approval"],
  ["debería haberlo hecho perfecto", "D3", "should_and_perfectionism"],
  ["descansar es de flojos", "D3", "guilt_for_resting"],
  ["o es perfecto o es un fracaso", "D3", "all_or_nothing"],
];

function reply(res, text) {
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ content: [{ type: "text", text }], model: "mock-llm-e2e" }));
}

http
  .createServer((req, res) => {
    if (req.method === "GET" && req.url === "/health") {
      res.writeHead(200).end("ok");
      return;
    }
    if (req.method !== "POST" || !req.url.startsWith("/v1/messages")) {
      console.log(`LLM simulado: ruta no soportada ${req.method} ${req.url}`);
      res.writeHead(404).end();
      return;
    }
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      const userContent = JSON.parse(body).messages?.[0]?.content ?? "";
      if (userContent.startsWith("Registro original:")) {
        // CU-04: la reescritura del registro completo; la IA le pone la carita (1 a 5).
        const rewritten = userContent.slice(userContent.lastIndexOf("Reescritura del estudiante:"));
        const harsh = rewritten.includes("inútil") && !rewritten.includes("no me hace");
        reply(res, JSON.stringify({ risk: false, mood: harsh ? 2 : 4 }));
        return;
      }
      // Cada frase conocida que aparece en el texto se devuelve con su tipo (una por cada uno de los 9 patrones).
      const findings = KNOWN_PHRASES.filter(([fragment]) => userContent.includes(fragment)).map(
        ([fragment, dimension, pattern]) => ({
          dimension,
          pattern,
          startIndex: 0,
          endIndex: 5,
          fragment,
          confidence: 0.9,
          sourceField: "q2",
        }),
      );
      reply(res, JSON.stringify({ risk: false, findings, model: "mock-llm-e2e" }));
    });
  })
  .listen(PORT, () => console.log(`LLM simulado en http://localhost:${PORT}`));
