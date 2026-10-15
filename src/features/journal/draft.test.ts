import { beforeEach, describe, expect, it } from "vitest";
import { DRAFT_KEY, clearDraft, hasText, loadDraft, saveDraft } from "@/features/journal/draft";

describe("journal draft (RS-DI-03)", () => {
  beforeEach(() => window.localStorage.clear());

  it("guarda y recupera lo escrito en este dispositivo", () => {
    expect(saveDraft({ mode: "FREE", freeText: "Hoy me fue bien" })).toBe(true);
    expect(loadDraft()).toEqual({ mode: "FREE", freeText: "Hoy me fue bien" });
  });

  it("sin texto no deja borrador (y borra el anterior)", () => {
    saveDraft({ mode: "GUIDED", q1: "algo" });
    expect(saveDraft({ mode: "GUIDED", q1: "   " })).toBe(false);
    expect(window.localStorage.getItem(DRAFT_KEY)).toBeNull();
  });

  it("solo cuenta como texto lo escrito en las preguntas o el texto libre", () => {
    expect(hasText({ mode: "GUIDED", moodBefore: 3 })).toBe(false);
    expect(hasText({ mode: "GUIDED", q3: "me sentí bien" })).toBe(true);
  });

  it("ignora un borrador dañado y se borra al enviar o cerrar sesión", () => {
    window.localStorage.setItem(DRAFT_KEY, "{roto");
    expect(loadDraft()).toBeNull();
    saveDraft({ mode: "FREE", freeText: "texto" });
    clearDraft();
    expect(loadDraft()).toBeNull();
  });
});
