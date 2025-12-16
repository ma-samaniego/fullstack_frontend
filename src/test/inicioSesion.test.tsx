import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import InicioSesion from "../pages/inicioSesion";

// Mock del módulo api para evitar llamadas HTTP reales durante los tests
vi.mock("../services/api", () => ({
  default: {
    post: vi.fn(),
  },
}));

// Mock de useNavigate para capturar la navegación sin cambiar el router real
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...(actual as any),
    useNavigate: () => mockNavigate,
  };
});

import api from "../services/api";

// Helper: intenta obtener un input por label y si no existe, usa el input por índice
function getInput(container: HTMLElement, labelRegex: RegExp, index = 0) {
  const byLabel = screen.queryByLabelText(labelRegex);
  if (byLabel) return byLabel as HTMLInputElement;
  const inputs = container.querySelectorAll("input");
  return inputs[index] as HTMLInputElement;
}

describe("Componente InicioSesion", () => {
  beforeEach(() => {
    // Limpiar mocks y storage antes de cada prueba
    vi.clearAllMocks();
    localStorage.clear();
    mockNavigate.mockReset();
    // Evitar que window.alert muestre diálogos durante las pruebas
    vi.spyOn(window, "alert").mockImplementation(() => {});
  });

  it("muestra los campos y botones requeridos", () => {
    const { container } = render(
      <MemoryRouter>
        <InicioSesion onLoginSuccess={vi.fn()} onNavigateToRegister={vi.fn()} />
      </MemoryRouter>
    );

    // Obtenemos los inputs por índice porque las labels pueden no estar asociadas por id
    const inputs = container.querySelectorAll("input");
    const userInput = inputs[0];
    const passInput = inputs[1];
    const ingresarBtn = screen.getByRole("button", { name: /ingresar/i });
    const registrateBtn = screen.getByRole("button", { name: /registrate/i });

    expect(userInput).toBeInTheDocument();
    expect(passInput).toBeInTheDocument();
    expect(ingresarBtn).toBeInTheDocument();
    expect(registrateBtn).toBeInTheDocument();
    expect(userInput).toHaveAttribute("required");
    expect(passInput).toHaveAttribute("required");
  });

  it("login exitoso: llama a api.post, guarda en localStorage y navega", async () => {
    // Preparamos el mock de la API para simular respuesta exitosa
    (api.post as any).mockResolvedValue({
      data: {
        token: "tokentest",
        usuario_id: 42,
        nombre_usuario: "vega",
        rol_id: 1,
      },
    });

    const { container } = render(
      <MemoryRouter>
        <InicioSesion onLoginSuccess={vi.fn()} onNavigateToRegister={vi.fn()} />
      </MemoryRouter>
    );

    // Obtener inputs con helper (label o índice)
    const userInput = getInput(container, /nombre de usuario|correo/i, 0);
    const passInput = getInput(container, /contraseñ|password|contraseña/i, 1);
    const ingresarBtn = screen.getByRole("button", { name: /ingresar/i });

    // Simular entrada del usuario y submit
    fireEvent.change(userInput, { target: { value: "vega" } });
    fireEvent.change(passInput, { target: { value: "1234" } });
    fireEvent.click(ingresarBtn);

    // Mientras la petición está en curso, el botón se deshabilita
    expect(ingresarBtn).toBeDisabled();
    expect(screen.getByRole("button", { name: /ingresando.../i })).toBeInTheDocument();

    // Comprobamos que la API fue llamada con los datos correctos
    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith("/api/v1/auth/login", {
        nombreUsuario: "vega",
        contrasena: "1234",
      });
    });

    // Comprobar que los efectos secundarios ocurrieron: guardado en localStorage y navegación
    expect(localStorage.getItem("token")).toBe("tokentest");
    expect(localStorage.getItem("usuario_id")).toBe(String(42));
    expect(localStorage.getItem("nombre_usuario")).toBe("vega");
    expect(localStorage.getItem("rol_id")).toBe(String(1));
    expect(mockNavigate).toHaveBeenCalledWith("/principal");
    expect(window.alert).toHaveBeenCalledWith(expect.stringContaining("vega"));
  });

  it("login fallido: muestra mensaje de error y no navega", async () => {
    // Simulamos que la API rechaza la promesa (error de autenticación/servidor)
    (api.post as any).mockRejectedValue(new Error("error servidor"));

    const { container } = render(
      <MemoryRouter>
        <InicioSesion onLoginSuccess={vi.fn()} onNavigateToRegister={vi.fn()} />
      </MemoryRouter>
    );

    // Usamos inputs por helper
    const userInput = getInput(container, /nombre de usuario|correo/i, 0);
    const passInput = getInput(container, /contraseñ|password|contraseña/i, 1);
    const ingresarBtn = screen.getByRole("button", { name: /ingresar/i });

    // Rellenar y enviar
    fireEvent.change(userInput, { target: { value: "vega" } });
    fireEvent.change(passInput, { target: { value: "wrong" } });
    fireEvent.click(ingresarBtn);

    // Esperar a que el componente muestre el mensaje de error
    expect(await screen.findByText(/credenciales incorrectas|error en el servidor/i)).toBeInTheDocument();
    // No se debe haber navegado
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("botón 'Registrate' llama a onNavigateToRegister", () => {
    const onNavigateToRegister = vi.fn();

    render(
      <MemoryRouter>
        <InicioSesion onLoginSuccess={vi.fn()} onNavigateToRegister={onNavigateToRegister} />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole("button", { name: /registrate/i }));
    expect(onNavigateToRegister).toHaveBeenCalled();
  });
});