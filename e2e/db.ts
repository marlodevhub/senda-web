import { execFileSync } from "node:child_process";
import path from "node:path";

/** Datos de prueba directo en la base `senda_e2e` (solo E2E; nunca toca la base de desarrollo). */
const COMPOSE_FILE = path.resolve(__dirname, "../../senda-api/compose.yaml");

function sql(statement: string): string {
  return execFileSync(
    "docker",
    ["compose", "-f", COMPOSE_FILE, "exec", "-T", "postgres", "psql", "-U", "senda", "-d", "senda_e2e", "-tAq", "-c", statement],
    { encoding: "utf8" },
  ).trim();
}

const ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";

/** Mismo formato y dígito verificador que `ActivationCodeFormat` del backend (RN-AC-01). */
function newParticipantCode(): string {
  let payload = "";
  for (let i = 0; i < 4; i++) {
    payload += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  const n = ALPHABET.length;
  let sum = 0;
  let double = true;
  for (let i = payload.length - 1; i >= 0; i--) {
    let value = ALPHABET.indexOf(payload[i]);
    if (double) {
      value *= 2;
      if (value >= n) value -= n - 1;
    }
    sum += value;
    double = !double;
  }
  return `C9-${payload}-${ALPHABET[(n - (sum % n)) % n]}`;
}

/** Un participante PENDIENTE en una cohorte EN_CURSO que empezó hace 2 días (día 3 de intervención). */
export function seedPendingParticipant(): string {
  const code = newParticipantCode();
  const cohortId = sql(
    "INSERT INTO cohort (name, start_date, end_date, status) " +
      "VALUES ('Cohorte E2E', CURRENT_DATE - 2, CURRENT_DATE + 25, 'IN_PROGRESS') RETURNING id;",
  );
  sql(`INSERT INTO participant (code, cohort_id) VALUES ('${code}', ${cohortId});`);
  return code;
}
