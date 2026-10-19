import { afterEach, describe, expect, it, vi } from "vitest";
import { renderWithProviders, screen } from "@/testing/test-utils";
import { MirrorView } from "@/features/analysis/components/mirror-view";
import type { Mirror } from "@/features/analysis/api/get-mirror";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

const TEXTS = { FREE_TEXT: "Si no saco 18 no valgo nada y soy un inútil." };

function mirrorWith(rewritten: boolean): Mirror {
  return {
    status: "COMPLETED",
    findings: [
      {
        findingId: 1,
        dimension: "D2",
        pattern: "worth_by_performance",
        field: "FREE_TEXT",
        start: 0,
        end: 29,
        confidence: 0.9,
        rewritten,
      },
      {
        findingId: 2,
        dimension: "D1",
        pattern: "self_disqualification",
        field: "FREE_TEXT",
        start: 32,
        end: 44,
        confidence: 0.95,
        rewritten,
      },
    ],
    predominantDimension: "D2",
    intensity: "MODERATE",
    confirmation: null,
  };
}

describe("MirrorView", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("el mensaje habla del tipo de frase de la dimensión predominante, no solo de la dimensión (RN-ES-13)", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation(
      async () => new Response(JSON.stringify(mirrorWith(false)), { status: 200 }),
    );
    renderWithProviders(<MirrorView journalEntryId={9} fieldTexts={TEXTS} />);

    expect(await screen.findByText(/Un resultado mide una tarea, no lo que vales/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Reescribir este registro" })).toBeInTheDocument();
  });

  it("si el registro ya se reescribió, ofrece reescribirlo nuevamente (CU-04)", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation(
      async () => new Response(JSON.stringify(mirrorWith(true)), { status: 200 }),
    );
    renderWithProviders(<MirrorView journalEntryId={9} fieldTexts={TEXTS} />);

    expect(await screen.findByRole("link", { name: "Reescribir nuevamente este registro" })).toHaveAttribute(
      "href",
      "/historial/9/reescribir",
    );
  });
});
