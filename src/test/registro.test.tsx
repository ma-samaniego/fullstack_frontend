import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Registro from "../pages/registro";

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

describe('Componente Registro', () => {
  beforeEach(() => { vi.clearAllMocks(); localStorage.clear(); });

  it('permite registrar un usuario y navega a inicio de sesión', async () => {
    (api.post as any).mockResolvedValue({});

    render(
      <MemoryRouter>
        <Registro />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/nombre de usuario/i), { target: { value: 'juan' } });
    fireEvent.change(screen.getByLabelText(/número de teléfono/i), { target: { value: '12345678' } });
    fireEvent.change(screen.getByLabelText(/correo electrónico/i), { target: { value: 'juan@example.com' } });
    fireEvent.change(screen.getByLabelText(/contraseña/i), { target: { value: 'secreto' } });

    fireEvent.click(screen.getByRole('button', { name: /registrarse/i }));

    await waitFor(() => expect(api.post).toHaveBeenCalled());
    expect(mockNavigate).toHaveBeenCalledWith('/inicioSesion');
  });
});
