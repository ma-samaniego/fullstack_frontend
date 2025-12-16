import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Donaciones from "../pages/donaciones";

vi.mock("../services/api", () => ({
  default: {
    post: vi.fn(),
  },
}));

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...(actual as any),
    useNavigate: () => mockNavigate,
  };
});

import api from "../services/api";

describe("Componente Donaciones", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    localStorage.setItem('usuario_id', '5');
  });

  it("permite seleccionar monto, completar tarjeta y donar", async () => {
    (api.post as any).mockResolvedValue({});

    render(
      <MemoryRouter>
        <Donaciones />
      </MemoryRouter>
    );

    // seleccionar un monto
    const btnMonto = await screen.findByRole('button', { name: /\$5,000|\$5000/ });
    fireEvent.click(btnMonto);

    const nombreTarjeta = screen.getByPlaceholderText(/Ej: Juan Pérez/i);
    const numeroTarjeta = screen.getByPlaceholderText(/0000 0000 0000 0000/i);

    fireEvent.change(nombreTarjeta, { target: { value: 'Juan' } });
    fireEvent.change(numeroTarjeta, { target: { value: '4111111111111111' } });

    const donarBtn = screen.getByRole('button', { name: /realizar donación/i });
    fireEvent.click(donarBtn);

    await waitFor(() => expect(api.post).toHaveBeenCalled());
    expect(mockNavigate).toHaveBeenCalledWith('/principal');
  });
});
