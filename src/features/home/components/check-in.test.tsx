import { afterEach, describe, expect, it, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import { renderWithProviders, screen } from "@/testing/test-utils";
import { CheckIn } from "@/features/home/components/check-in";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

function mockCheckInResponse(mood: number) {
  return vi
    .spyOn(globalThis, "fetch")
    .mockResolvedValue(
      new Response(JSON.stringify({ mood, interventionDay: 3, invitesToWrite: mood <= 2 }), { status: 200 }),
    );
}

describe("CheckIn", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("guarda la cara tocada con PUT /checkins/today y agradece (CU-06)", async () => {
    const fetchMock = mockCheckInResponse(4);
    const user = userEvent.setup();
    renderWithProviders(<CheckIn initialMood={null} />);

    await user.click(screen.getByRole("radio", { name: "Bien" }));

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/checkins/today",
      expect.objectContaining({ method: "PUT", body: JSON.stringify({ mood: 4 }) }),
    );
    expect(await screen.findByText("Gracias por contarnos.")).toBeInTheDocument();
    expect(screen.queryByText(/Parece un día difícil/)).not.toBeInTheDocument();
  });

  it("con ánimo 1 o 2 invita a escribir, sin obligar (RN-IN-05)", async () => {
    mockCheckInResponse(2);
    const user = userEvent.setup();
    renderWithProviders(<CheckIn initialMood={null} />);

    await user.click(screen.getByRole("radio", { name: "Mal" }));

    expect(await screen.findByText(/Parece un día difícil/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Escribir" })).toHaveAttribute("href", "/diario");
  });

  it("marca la cara del check-in que ya hizo hoy", () => {
    renderWithProviders(<CheckIn initialMood={3} />);

    expect(screen.getAllByRole("radio")[2]).toHaveAttribute("aria-checked", "true");
  });
});
