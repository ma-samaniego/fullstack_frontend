import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Home from "../pages/home";

vi.mock("../services/api", () => ({
  default: {
    get: vi.fn(),
  },
}));

import api from "../services/api";

describe('Componente Home', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('carga y muestra estadísticas correctamente', async () => {
    const mockPublicaciones = [
      { id: 1, authorname: 'user1', title: 'Post 1' },
      { id: 2, authorname: 'user2', title: 'Post 2' }
    ];

    const mockComentarios = [
      { id: 1, contenido: 'Comentario 1' },
      { id: 2, contenido: 'Comentario 2' }
    ];

    (api.get as any).mockImplementation((url: string) => {
      if (url === '/api/publicaciones') {
        return Promise.resolve({ data: mockPublicaciones });
      }
      if (url.startsWith('/api/comentarios/publicacion/')) {
        return Promise.resolve({ data: mockComentarios });
      }
      if (url === '/api/v1/usuarios') {
        return Promise.reject(new Error('Endpoint no disponible'));
      }
      return Promise.reject(new Error('Unknown endpoint'));
    });

    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    expect(screen.getByText(/pixelhub/i)).toBeInTheDocument();
    expect(screen.getByText(/tu comunidad de desarrollo y creatividad digital/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('2')).toBeInTheDocument(); // usuarios
      expect(screen.getByText('Hilos Creados')).toBeInTheDocument();
      expect(screen.getByText('Comentarios')).toBeInTheDocument();
    });

    expect(api.get).toHaveBeenCalledWith('/api/publicaciones');
  });

  it('muestra los enlaces de navegación correctamente', () => {
    (api.get as any).mockResolvedValue({ data: [] });

    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    expect(screen.getByText(/explorar hilos/i)).toBeInTheDocument();
    expect(screen.getByText(/apoyar el proyecto/i)).toBeInTheDocument();
  });

  it('muestra las tarjetas de características', () => {
    (api.get as any).mockResolvedValue({ data: [] });

    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    expect(screen.getByText(/foros dinámicos/i)).toBeInTheDocument();
    expect(screen.getByText(/creatividad/i)).toBeInTheDocument();
    expect(screen.getByText(/innovación/i)).toBeInTheDocument();
  });
});
