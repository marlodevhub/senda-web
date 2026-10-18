import { execFileSync } from "node:child_process";
import { createHash, randomBytes } from "node:crypto";
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

/** El día de intervención se cuenta en hora de Lima (RN-TR-07); la base corre en UTC. */
const LIMA_TODAY = "(now() AT TIME ZONE 'America/Lima')::date";

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
    `INSERT INTO cohort (name, start_date, end_date, status) ` +
      `VALUES ('Cohorte E2E', ${LIMA_TODAY} - 2, ${LIMA_TODAY} + 25, 'IN_PROGRESS') RETURNING id;`,
  );
  sql(`INSERT INTO participant (code, cohort_id) VALUES ('${code}', ${cohortId});`);
  return code;
}

/** Un mensaje R7 ENVIADO, como si lo hubiera dejado la revisión de las 19:00 (CU-13). */
export function seedSentMessage(participantCode: string): void {
  sql(
    "INSERT INTO message (participant_id, decision_date, moment, rule, variant_index, catalog_version, result, " +
      `action_type, created_at) SELECT id, ${LIMA_TODAY}, 'EVENING_REVIEW', 'R7', 0, 'v1', 'SENT', 'WRITE', now() ` +
      `FROM participant WHERE code = '${participantCode}';`,
  );
}

/**
 * CU-28: una invitación vigente de un administrador ya existente (que en esta prueba no entra, así que su contraseña y
 * su TOTP son de relleno). Devuelve el código; la base solo guarda su SHA-256, como el backend.
 */
export function seedAdminInvitation(): string {
  const raw = randomBytes(9).toString("hex").toUpperCase().slice(0, 12);
  const code = `${raw.slice(0, 4)}-${raw.slice(4, 8)}-${raw.slice(8)}`;
  const hash = createHash("sha256").update(raw).digest("hex");
  const inviterId = sql(
    "INSERT INTO admin_user (email, password_hash, totp_secret_encrypted, created_at) " +
      `VALUES ('invita-${raw.toLowerCase()}@senda.test', 'x', 'x', now()) RETURNING id;`,
  );
  sql(
    "INSERT INTO admin_invitation (code_hash, created_by_admin_id, created_at, expires_at) " +
      `VALUES ('${hash}', ${inviterId}, now(), now() + interval '1 day');`,
  );
  return code;
}
