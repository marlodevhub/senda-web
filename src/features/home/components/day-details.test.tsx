import { afterEach, describe, expect, it, vi } from "vitest";
import { renderWithProviders, screen } from "@/testing/test-utils";
import { DayDetails } from "@/features/home/components/day-details";

describe("DayDetails", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("si escribió, muestra el registro sin textos, con acceso a verlo y a reescribir lo que falta (CU-05)", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          items: [
            {
              id: 7,
              date: "2026-10-17",
              interventionDay: 3,
              moodBefore: 2,
              mode: "FREE",
              context: "STUDIES",
              findingsCount: 2,
              rewritesCount: 1,
              pendingCount: 1,
            },
            {
              id: 6,
              date: "2026-10-16",
              interventionDay: 2,
              moodBefore: 4,
              mode: "GUIDED",
              context: "FAMILY",
              findingsCount: 0,
              rewritesCount: 0,
              pendingCount: 0,
            },
          ],
          hasMore: false,
        }),
        { status: 200 },
      ),
    );
    renderWithProviders(
      <DayDetails day={{ interventionDay: 3, date: "2026-10-17", hasEntry: true, mood: 2 }} today={3} />,
    );

    expect(await screen.findByText("Escribiste")).toBeInTheDocument();
    expect(screen.getByText("Estudios · Libre")).toBeInTheDocument();
    expect(screen.getByText("2 frases detectadas · 1 reescrita")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Ver registro" })).toHaveAttribute("href", "/historial/7");
    expect(screen.getByRole("link", { name: "Reescribir" })).toHaveAttribute("href", "/historial/7/reescribir");
    // Solo el registro de ese día, aunque la semana traiga otros.
    expect(screen.getAllByText("Escribiste")).toHaveLength(1);
    expect(String(fetchMock.mock.calls[0][0])).toContain("/api/v1/journal-entries?week=1");
  });

  it("si solo marcó su ánimo, muestra su carita sin pedir registros", () => {
    const fetchMock = vi.spyOn(globalThis, "fetch");
    renderWithProviders(
      <DayDetails day={{ interventionDay: 2, date: "2026-10-16", hasEntry: false, mood: 4 }} today={3} />,
    );

    expect(screen.getByText("Marcaste tu ánimo")).toBeInTheDocument();
    expect(screen.getByText("Bien")).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("un día pasado sin nada se dice sin reproche, y uno que viene, que todavía no llega", () => {
    const { unmount } = renderWithProviders(
      <DayDetails day={{ interventionDay: 1, date: "2026-10-15", hasEntry: false, mood: null }} today={3} />,
    );
    expect(screen.getByText(/Está bien: la meta es 3 días por semana/)).toBeInTheDocument();
    unmount();

    renderWithProviders(
      <DayDetails day={{ interventionDay: 9, date: "2026-10-23", hasEntry: false, mood: null }} today={3} />,
    );
    expect(screen.getByText("Este día todavía no llega.")).toBeInTheDocument();
  });
});
