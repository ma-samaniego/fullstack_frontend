import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Admin from "../pages/admin";

vi.mock("../services/api", () => ({
  default: {
    get: vi.fn(),
    delete: vi.fn(),
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

describe('Componente Admin', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    vi.spyOn(window, 'confirm').mockImplementation(() => true);
  });

  it('redirige a login si no hay token', () => {
    localStorage.removeItem('token');

    render(
      <MemoryRouter>
        <Admin />
      </MemoryRouter>
    );

    expect(mockNavigate).toHaveBeenCalledWith('/inicioSesion', { state: { from: 'admin' } });
  });

  it('redirige a principal si el usuario no es administrador', () => {
    localStorage.setItem('token', 'fake-token');
    localStorage.setItem('rol_id', '2'); // No es admin

    const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});

    render(
      <MemoryRouter>
        <Admin />
      </MemoryRouter>
    );

    expect(alertMock).toHaveBeenCalledWith('Acceso denegado: Solo administradores pueden acceder a esta página');
    expect(mockNavigate).toHaveBeenCalledWith('/principal');

    alertMock.mockRestore();
  });

  it('carga y muestra publicaciones para administrador', async () => {
    localStorage.setItem('token', 'fake-token');
    localStorage.setItem('rol_id', '1'); // Es admin

    const mockPublicaciones = [
      {
        id: 1,
        userid: 1,
        category: 'Shooter',
        title: 'Test Post',
        description: 'Test Description',
        authorname: 'TestUser',
        createDt: '2025-01-15T00:00:00',
        likes: 5
      }
    ];

    (api.get as any).mockResolvedValue({ data: mockPublicaciones });

    render(
      <MemoryRouter>
        <Admin />
      </MemoryRouter>
    );

    expect(screen.getByText(/panel de administración/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Test Post')).toBeInTheDocument();
      expect(screen.getByText('TestUser')).toBeInTheDocument();
      expect(screen.getByText('Shooter')).toBeInTheDocument();
    });

    expect(api.get).toHaveBeenCalledWith('/api/publicaciones');
  });

  it('permite cambiar entre pestañas de publicaciones y comentarios', async () => {
    localStorage.setItem('token', 'fake-token');
    localStorage.setItem('rol_id', '1');

    (api.get as any).mockResolvedValue({ data: [] });

    render(
      <MemoryRouter>
        <Admin />
      </MemoryRouter>
    );

    const comentariosTab = screen.getByRole('button', { name: /comentarios/i });
    fireEvent.click(comentariosTab);

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/api/comentarios');
    });
  });

  it('permite eliminar una publicación', async () => {
    localStorage.setItem('token', 'fake-token');
    localStorage.setItem('rol_id', '1');

    const mockPublicaciones = [
      {
        id: 1,
        userid: 1,
        category: 'Shooter',
        title: 'Post a eliminar',
        description: 'Test',
        authorname: 'TestUser',
        createDt: '2025-01-15T00:00:00',
        likes: 5
      }
    ];

    (api.get as any).mockResolvedValue({ data: mockPublicaciones });
    (api.delete as any).mockResolvedValue({});

    render(
      <MemoryRouter>
        <Admin />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Post a eliminar')).toBeInTheDocument();
    });

    const deleteButton = screen.getByRole('button', { name: /eliminar/i });
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(api.delete).toHaveBeenCalledWith('/api/publicaciones/1');
    });
  });

  it('navega al detalle de publicación al hacer clic en el título', async () => {
    localStorage.setItem('token', 'fake-token');
    localStorage.setItem('rol_id', '1');

    const mockPublicaciones = [
      {
        id: 1,
        userid: 1,
        category: 'Shooter',
        title: 'Publicación Clickeable',
        description: 'Test',
        authorname: 'TestUser',
        createDt: '2025-01-15T00:00:00',
        likes: 5
      }
    ];

    (api.get as any).mockResolvedValue({ data: mockPublicaciones });

    render(
      <MemoryRouter>
        <Admin />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Publicación Clickeable')).toBeInTheDocument();
    });

    const titleElement = screen.getByText('Publicación Clickeable');
    fireEvent.click(titleElement);

    expect(mockNavigate).toHaveBeenCalledWith('/hilo/1');
  });
});
