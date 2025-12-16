import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Cuenta from "../pages/cuenta";

// 1. Mock de la API: Simulamos las peticiones al backend para no depender de un servidor real.
vi.mock("../services/api", () => ({
  default: {
    get: vi.fn(), // Simula obtener datos
    put: vi.fn(), // Simula actualizar datos
  },
}));

// 2. Mock del Router: Interceptamos 'useNavigate' para verificar si el usuario es redirigido.
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...(actual as any),
    useNavigate: () => mockNavigate,
  };
});

import api from "../services/api";

describe("Componente Cuenta", () => {
  // 3. Limpieza: Antes de cada test, borramos los registros de los mocks y del localStorage.
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("muestra datos del usuario y permite guardar cambios", async () => {
    // 4. Preparación (Arrange): Aseguramos que haya sesión y configuramos la respuesta falsa del GET
    localStorage.setItem('usuario_id', '42');
    (api.get as any).mockResolvedValue({ data: { nombre_usuario: "vega", correo: "vega@example.com" } });

    // 5. Renderizado: Montamos el componente dentro de un Router virtual.
    render(
      <MemoryRouter>
        <Cuenta />
      </MemoryRouter>
    );

    // Verificamos que el título aparezca en pantalla.
    expect(await screen.findByText(/configuración de cuenta/i)).toBeInTheDocument();

    // 6. Selección de elementos: Buscamos los inputs por su etiqueta (label).
    const nombre = await screen.findByLabelText(/nombre de usuario/i);
    const correo = await screen.findByLabelText(/correo electrónico/i);

    // 7. Acción (Act): Simulamos que el usuario escribe nuevos valores.
    fireEvent.change(nombre, { target: { value: "vega2" } });
    fireEvent.change(correo, { target: { value: "vega2@example.com" } });

    // Configuramos la respuesta exitosa para el PUT (guardado).
    (api.put as any).mockResolvedValue({});

    // Simulamos el clic en el botón de guardar.
    const guardar = screen.getByRole("button", { name: /guardar cambios/i });
    fireEvent.click(guardar);

    // 8. Aserción (Assert): Verificamos que la API se llamó y que el localStorage se actualizó.
    await waitFor(() => expect(api.put).toHaveBeenCalled());
    expect(localStorage.getItem("nombre_usuario")).toBe("vega2");
  });
});