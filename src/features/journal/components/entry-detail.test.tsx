import { afterEach, describe, expect, it, vi } from "vitest";
import { renderWithProviders, screen } from "@/testing/test-utils";
import { EntryDetail } from "@/features/journal/components/entry-detail";
import type { JournalEntryDetail } from "@/features/journal/api/get-entry-detail";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

const ENTRY: JournalEntryDetail = {
  id: 22,
  date: "2026-10-14",
  interventionDay: 11,
  mode: "FREE",
  moodBefore: 2,
  q1: null,
  q2: null,
  q3: null,
  freeText: "Soy un inútil, siempre la malogro.",
  context: "STUDIES",
  status: "COMPLETED",
  mirror: {
    findings: [
      {
        findingId: 5,
        dimension: "D1",
        pattern: "self_disqualification",
        field: "FREE_TEXT",
        start: 0,
        end: 13,
        confidence: 0.9,
      },
    ],
    predominantDimension: "D1",
    intensity: "LOW",
    confirmation: null,
  },
  rewrites: [
    {
      id: 3,
      findingId: 5,
      dimension: "D1",
      pattern: "self_disqualification",
      result: "RISK",
      moodAfter: null,
      attemptNumber: 1,
      inJar: false,
      originalPhrase: "Soy un inútil",
      text: "Me cuesta, pero sigo",
    },
    {
      id: 4,
      findingId: 5,
      dimension: "D1",
      pattern: "self_disqualification",
      result: "SOFTENED",
      moodAfter: 4,
      attemptNumber: 2,
      inJar: true,
      originalPhrase: "Soy un inútil",
      text: "Me equivoqué y puedo aprender de esto",
    },
  ],
};

describe("EntryDetail", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("muestra una reescritura con señal de cuidado como 'Guardada', sin nombrarla ni fallar (RN-ES-11)", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation(async () => new Response(JSON.stringify(ENTRY), { status: 200 }));
    renderWithProviders(<EntryDetail journalEntryId={22} />);

    expect(await screen.findByText("Intento 1")).toBeInTheDocument();
    expect(screen.getByText("Guardada")).toBeInTheDocument();
    expect(screen.queryByText(/riesgo/i)).not.toBeInTheDocument();
  });

  it("muestra cada versión con su texto bajo la frase original (RN-HI-03)", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation(async () => new Response(JSON.stringify(ENTRY), { status: 200 }));
    renderWithProviders(<EntryDetail journalEntryId={22} />);

    expect(await screen.findByText("Me cuesta, pero sigo")).toBeInTheDocument();
    expect(screen.getByText("Me equivoqué y puedo aprender de esto")).toBeInTheDocument();
    expect(screen.getByText("Intento 2")).toBeInTheDocument();
    expect(screen.getByText("Se suavizó")).toBeInTheDocument();
    expect(screen.getByText("Guardada en el frasco")).toBeInTheDocument();
  });
});
