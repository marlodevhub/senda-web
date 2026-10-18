import { afterEach, describe, expect, it, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import { renderWithProviders, screen } from "@/testing/test-utils";
import { CheckIn } from "@/features/home/components/check-in";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

function mockCheckInResponse(mood: number) {
  return vi
    .spyOn(globalThis, "fetch")
    .mockImplementation(
      async () =>
        new Response(
          JSON.stringify({
            mood,
            interventionDay: 3,
            invitesToWrite: mood <= 2,
            recordedAt: "2026-10-15T20:05:00Z",
            moodCountToday: 2,
          }),
          { status: 200 },
        ),
    );
}

describe("CheckIn", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("guarda la cara tocada como una marca con POST /checkins e invita a escribir (CU-06)", async () => {
    const fetchMock = mockCheckInResponse(4);
    const user = userEvent.setup();
    renderWithProviders(<CheckIn initialMood={null} />);

    await user.click(screen.getByRole("radio", { name: "Bien" }));

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/checkins",
      expect.objectContaining({ method: "POST", body: JSON.stringify({ mood: 4 }) }),
    );
    expect(
      await screen.findByText("Qué bueno. Si quieres, cuéntale a tu diario qué te hizo bien hoy."),
    ).toBeInTheDocument();
    expect(screen.queryByText(/Parece un día difícil/)).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Escribir" })).toHaveAttribute("href", "/diario?animo=4");
  });

  it("la burbuja de la carita empieza con cuántas veces la marcó hoy", async () => {
    mockCheckInResponse(4);
    const user = userEvent.setup();
    renderWithProviders(<CheckIn initialMood={null} />);

    await user.click(screen.getByRole("radio", { name: "Bien" }));

    expect(await screen.findByTestId("mood-bubble-count")).toHaveTextContent("2");
  });

  it("sin una cara marcada no muestra la invitación ni el botón Escribir", () => {
    renderWithProviders(<CheckIn initialMood={null} />);

    expect(screen.queryByRole("link", { name: "Escribir" })).not.toBeInTheDocument();
  });

  it("con ánimo 1 o 2 invita a escribir, sin obligar (RN-IN-05)", async () => {
    mockCheckInResponse(2);
    const user = userEvent.setup();
    renderWithProviders(<CheckIn initialMood={null} />);

    await user.click(screen.getByRole("radio", { name: "Mal" }));

    expect(await screen.findByText(/Parece un día difícil/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Escribir" })).toHaveAttribute("href", "/diario?animo=2");
  });

  it("la invitación cambia según la cara tocada", async () => {
    mockCheckInResponse(5);
    const user = userEvent.setup();
    renderWithProviders(<CheckIn initialMood={null} />);

    await user.click(screen.getByRole("radio", { name: "Regular" }));
    expect(await screen.findByText(/Un día a medias también cuenta/)).toBeInTheDocument();

    await user.click(screen.getByRole("radio", { name: "Muy bien" }));
    expect(await screen.findByText(/¡Qué buen día!/)).toBeInTheDocument();
    expect(screen.queryByText(/Un día a medias/)).not.toBeInTheDocument();
  });

  it("marca la cara de la última marca de hoy y dice a qué hora fue (hora de Lima)", () => {
    renderWithProviders(<CheckIn initialMood={3} initialMarkedAt="2026-10-15T14:30:00Z" />);

    expect(screen.getAllByRole("radio")[2]).toHaveAttribute("aria-checked", "true");
    expect(screen.getByText(/^A las 9:30\sa\.\sm\. marcaste tu ánimo\./)).toBeInTheDocument();
  });

  it("al marcar otra vez, muestra la hora que guardó el servidor (RN-IN-03)", async () => {
    mockCheckInResponse(4);
    const user = userEvent.setup();
    renderWithProviders(<CheckIn initialMood={3} initialMarkedAt="2026-10-15T14:30:00Z" />);

    await user.click(screen.getByRole("radio", { name: "Bien" }));

    expect(await screen.findByText(/^A las 3:05\sp\.\sm\. marcaste tu ánimo\./)).toBeInTheDocument();
  });
});
