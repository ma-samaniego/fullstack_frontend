import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Principal from "../pages/principal";

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
  };
});

import api from "../services/api";

describe('Componente Principal', () => {
  beforeEach(() => { vi.clearAllMocks(); localStorage.clear(); });

  it('muestra publicaciones y permite abrir hilo', async () => {
    (api.get as any).mockResolvedValue({ data: [ { id: 10, title: 'Un Hilo', category: 'Shooter', authorname: 'Autor', createDt: '2025-01-02T00:00:00' } ] });

    render(
      <MemoryRouter>
        <Principal />
      </MemoryRouter>
    );

    expect(await screen.findByText(/pixelhub/i)).toBeInTheDocument();
    const card = await screen.findByText(/un hilo/i);
    fireEvent.click(card);

    await waitFor(() => expect(mockNavigate).toHaveBeenCalled());
  });
});
