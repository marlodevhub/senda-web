import { describe, expect, it } from "vitest";
import { renderWithProviders, screen } from "@/testing/test-utils";
import { TodayMirrorCard } from "@/features/home/components/today-mirror-card";

describe("TodayMirrorCard", () => {
  it("lleva al Espejo de hoy y dice cuántas frases notó (CU-05 → CU-03)", () => {
    renderWithProviders(
      <TodayMirrorCard entry={{ journalEntryId: 40, analysisStatus: "COMPLETED", findingsCount: 2 }} />,
    );

    expect(screen.getByRole("link", { name: /Tu espejo de hoy/ })).toHaveAttribute("href", "/historial/40/espejo");
    expect(screen.getByText("Noté 2 frases en tu voz interna.")).toBeInTheDocument();
  });

  it("con un registro en cuidado no cuenta frases ni nombra el riesgo (RN-ES-11)", () => {
    renderWithProviders(<TodayMirrorCard entry={{ journalEntryId: 41, analysisStatus: "RISK", findingsCount: 0 }} />);

    expect(screen.getByText("Mira lo que noté en lo que escribiste.")).toBeInTheDocument();
    expect(screen.queryByText(/riesgo/i)).not.toBeInTheDocument();
  });
});
