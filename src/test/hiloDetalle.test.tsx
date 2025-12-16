import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import HiloDetalle from "../pages/hiloDetalle";

vi.mock("../services/api", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...(actual as any),
    useNavigate: () => mockNavigate,
    useParams: () => ({ id: '1' }),
    useLocation: () => ({ state: { hilo: { id: 1, title: 'Prueba', description: 'Contenido', category: 'Indie', createDt: '2025-01-01T00:00:00', authorname: 'Autor' } } }),
  };
});

describe('Componente HiloDetalle', () => {
  beforeEach(() => { vi.clearAllMocks(); localStorage.clear(); });

  it('muestra el contenido del hilo y campo de comentarios', () => {
    render(
      <MemoryRouter>
        <HiloDetalle />
      </MemoryRouter>
    );

    expect(screen.getByText(/prueba/i)).toBeInTheDocument();
    expect(screen.getByText(/contenido/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Escribe un comentario/i)).toBeInTheDocument();
  });
});
