import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "@/testing/test-utils";
import { GardenView } from "@/features/progress/components/garden-view";
import type { Garden } from "@/features/progress/api/get-garden";

const EMPTY_GARDEN: Garden = {
  general: { elements: 0, stage: 0 },
  raices: { elements: 0, stage: 0 },
  flores: { elements: 0, stage: 0 },
  ritmo: { elements: 0, stage: 0 },
  especiales: [],
};

const GROWN_GARDEN: Garden = {
  general: { elements: 4, stage: 2 },
  raices: { elements: 1, stage: 1 },
  flores: { elements: 0, stage: 0 },
  ritmo: { elements: 0, stage: 0 },
  especiales: ["S1"],
};

describe("GardenView", () => {
  it("muestra el jardín vacío sin acciones (RN-PR-02)", () => {
    renderWithProviders(<GardenView garden={EMPTY_GARDEN} />);

    expect(screen.getByText("Tu jardín empieza con tu primer registro.")).toBeInTheDocument();
    expect(screen.getByText("Semilla")).toBeInTheDocument();
  });

  it("muestra las 3 zonas y el elemento especial de la semana cumplida", () => {
    renderWithProviders(<GardenView garden={GROWN_GARDEN} />);

    expect(screen.getByText("Raíces")).toBeInTheDocument();
    expect(screen.getByText("Flores")).toBeInTheDocument();
    expect(screen.getByText("Ritmo")).toBeInTheDocument();
    expect(screen.getByText("Banca de la semana 1")).toBeInTheDocument();
    // Describe sin calificar: cuántos registros lo regaron y en qué etapa va cada zona.
    expect(screen.getByText("4")).toBeInTheDocument();
    expect(screen.getByText("Retoño")).toBeInTheDocument();
    expect(screen.getByText(/Brote · 1 brote/)).toBeInTheDocument();
  });

  it("no muestra elementos especiales cuando no se cumplió ninguna meta semanal", () => {
    renderWithProviders(<GardenView garden={{ ...GROWN_GARDEN, especiales: [] }} />);

    expect(screen.queryByText("Semanas en que cumpliste tu meta")).not.toBeInTheDocument();
  });
});
