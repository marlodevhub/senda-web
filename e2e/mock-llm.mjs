// LLM simulado para las pruebas E2E: imita la Messages API de Anthropic
// (POST /v1/messages) con respuestas fijas, para no gastar ni depender del
// proveedor real. Las posiciones de la frase van mal contadas a propósito:
// el backend debe ubicar la frase por su texto (FragmentLocator).
import http from "node:http";

const PORT = Number(process.env.MOCK_LLM_PORT ?? 4010);

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
      const findings = userContent.includes("Soy un inútil")
        ? [{
            dimension: "D1",
            pattern: "self_disqualification",
            startIndex: 0,
            endIndex: 5,
            fragment: "Soy un inútil",
            confidence: 0.9,
            sourceField: "q2",
          }]
        : [];
      reply(res, JSON.stringify({ risk: false, findings, model: "mock-llm-e2e" }));
    });
  })
  .listen(PORT, () => console.log(`LLM simulado en http://localhost:${PORT}`));
