import { afterEach, describe, expect, it, vi } from "vitest";
import { renderWithProviders, screen, waitFor } from "@/testing/test-utils";
import { JournalForm } from "@/features/journal/components/journal-form";
import { DRAFT_KEY } from "@/features/journal/draft";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

describe("JournalForm", () => {
  afterEach(() => {
    localStorage.clear();
  });

  it("abre con la cara del check-in de hoy ya marcada (CU-06 → CU-01)", async () => {
    renderWithProviders(<JournalForm checkinMood={2} />);

    await waitFor(() => expect(screen.getByRole("radio", { name: "Mal" })).toHaveAttribute("aria-checked", "true"));
  });

  it("el borrador recuperado manda sobre el check-in (RS-DI-03)", async () => {
    localStorage.setItem(
      DRAFT_KEY,
      JSON.stringify({ mode: "GUIDED", moodBefore: 4, q1: "Hoy fue un día largo en la universidad" }),
    );
    renderWithProviders(<JournalForm checkinMood={2} />);

    expect(await screen.findByDisplayValue("Hoy fue un día largo en la universidad")).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Bien" })).toHaveAttribute("aria-checked", "true");
    expect(screen.getByRole("radio", { name: "Mal" })).toHaveAttribute("aria-checked", "false");
  });

  it("la cara recién elegida en Inicio manda sobre la del borrador y la del check-in, y el borrador conserva su texto", async () => {
    localStorage.setItem(
      DRAFT_KEY,
      JSON.stringify({ mode: "GUIDED", moodBefore: 4, q1: "Hoy fue un día largo en la universidad" }),
    );
    renderWithProviders(<JournalForm checkinMood={2} chosenMood={5} />);

    expect(await screen.findByDisplayValue("Hoy fue un día largo en la universidad")).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.getByRole("radio", { name: "Muy bien" })).toHaveAttribute("aria-checked", "true"),
    );
    expect(screen.getByRole("radio", { name: "Bien" })).toHaveAttribute("aria-checked", "false");
  });
});
