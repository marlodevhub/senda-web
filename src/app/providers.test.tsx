import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { useQueryClient, type QueryClient } from "@tanstack/react-query";
import { Providers } from "@/app/providers";
import { LOGOUT_EVENT } from "@/lib/auth/logout";

describe("Providers", () => {
  it("al cerrar sesión borra todo lo cargado: nada del estudiante queda en memoria", () => {
    let client: QueryClient | undefined;
    function Capture() {
      client = useQueryClient();
      return null;
    }
    render(
      <Providers>
        <Capture />
      </Providers>,
    );
    client!.setQueryData(["home"], { preferredName: "Lucía" });

    window.dispatchEvent(new Event(LOGOUT_EVENT));

    expect(client!.getQueryData(["home"])).toBeUndefined();
  });
});
