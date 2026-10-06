import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "@/testing/test-utils";
import { StatsView } from "@/features/progress/components/stats-view";
import type { Stats } from "@/features/progress/api/get-stats";

const BASE_STATS: Stats = {
  hasEnoughData: true,
  mood: [{ interventionDay: 1, averageMood: 3 }],
  beforeAfter: [],
  transformed: [{ week: 1, detected: 2, rewritten: 1 }],
  voiceByWeek: [{ week: 1, dimension: "D1", count: 1 }],
  byContext: [{ context: "STUDIES", count: 1 }],
  consistency: [{ week: 1, daysWithEntry: 3, goal: 3 }],
};

describe("StatsView", () => {
  it("muestra el mensaje de datos insuficientes antes del 3er registro (RN-PR-07)", () => {
    renderWithProviders(<StatsView stats={{ ...BASE_STATS, hasEnoughData: false }} />);

    expect(
      screen.getByText("Aún estamos reuniendo tus datos. Vuelve después de tu tercer registro."),
    ).toBeInTheDocument();
    expect(screen.queryByText("Mi ánimo")).not.toBeInTheDocument();
  });

  it("muestra los 6 gráficos cuando hay datos suficientes", () => {
    renderWithProviders(<StatsView stats={BASE_STATS} />);

    expect(screen.getByText("Mi ánimo")).toBeInTheDocument();
    expect(screen.getByText("Antes y después de reescribir")).toBeInTheDocument();
    expect(screen.getByText("Frases transformadas")).toBeInTheDocument();
    expect(screen.getByText("Mi voz interna por semana")).toBeInTheDocument();
    expect(screen.getByText("Dónde aparece")).toBeInTheDocument();
    expect(screen.getByText("Mi constancia")).toBeInTheDocument();
  });

  it("muestra `datos.sin_pares` cuando no hay reescrituras con ánimo posterior", () => {
    renderWithProviders(<StatsView stats={BASE_STATS} />);

    expect(
      screen.getByText("Cuando reescribas una frase y marques cómo te sientes después, verás aquí la diferencia."),
    ).toBeInTheDocument();
  });
});
