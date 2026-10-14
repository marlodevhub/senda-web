import { beforeEach, describe, expect, it } from "vitest";
import type { Message } from "@/features/guidance/api/get-messages";
import { loadNotifiedIds, pickUnnotified, saveNotifiedIds } from "@/features/guidance/notified-messages";

function message(id: number, opened = false): Message {
  return {
    id,
    rule: "R6",
    dimension: null,
    text: "Mensaje del catálogo",
    actionType: "NONE",
    actionJournalEntryId: null,
    actionFindingId: null,
    opened,
    createdAt: "2026-10-14T19:00:00-05:00",
  };
}

describe("notified messages", () => {
  beforeEach(() => window.localStorage.clear());

  it("avisa solo los mensajes sin abrir que no se avisaron antes", () => {
    const pending = pickUnnotified([message(3), message(2, true), message(1)], new Set([1]));
    expect(pending.map((m) => m.id)).toEqual([3]);
  });

  it("recuerda los ids avisados entre visitas", () => {
    saveNotifiedIds([4, 7]);
    expect(loadNotifiedIds()).toEqual(new Set([4, 7]));
  });

  it("ignora un valor guardado que no es una lista de ids", () => {
    window.localStorage.setItem("senda:notified-messages", "{roto");
    expect(loadNotifiedIds().size).toBe(0);
  });
});
