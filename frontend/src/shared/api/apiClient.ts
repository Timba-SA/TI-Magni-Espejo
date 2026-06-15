const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

function getStoredToken(): string | null {
  return localStorage.getItem("the_food_store_token");
}

/** Limpia la sesión y redirige al login cuando el token expira. */
export function handleTokenExpired(): void {
  localStorage.removeItem("the_food_store_token");
  localStorage.removeItem("the_food_store_session");
  // Redirige solo si no estamos ya en el login
  if (!window.location.pathname.includes("/login")) {
    window.location.href = "/login";
  }
}

export async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_URL}${endpoint}`;

  const token = getStoredToken();

  const defaultHeaders: HeadersInit = {
    ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
    "Accept": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const response = await fetch(url, {
    credentials: "include",
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });

  if (!response.ok) {
    // 401 o 403 → token expirado o inválido / no autorizado: limpiar sesión y redirigir al login
    if (response.status === 401 || response.status === 403) {
      // En la pantalla de login el 401 significa credenciales incorrectas, no sesión expirada
      const isLoginEndpoint = endpoint.includes("/auth/login") || endpoint.includes("/auth/register");
      if (!isLoginEndpoint) {
        handleTokenExpired();
      }
      const msg = response.status === 403
        ? "No tenés permisos para realizar esta acción."
        : isLoginEndpoint
          ? "Credenciales incorrectas. Verificá usuario y contraseña."
          : "Tu sesión expiró. Iniciá sesión nuevamente.";
      throw new Error(msg);
    }

    let errorMessage = "Ocurrió un error en la solicitud";
    try {
      const errorData = await response.json();
      if (Array.isArray(errorData.detail)) {
        // 422 Pydantic: detail es un array de { loc, msg, type }
        errorMessage = errorData.detail
          .map((e: { loc?: string[]; msg: string }) =>
            e.loc ? `${e.loc.slice(-1)[0]}: ${e.msg}` : e.msg
          )
          .join(" | ");
      } else if (typeof errorData.detail === "string") {
        errorMessage = errorData.detail;
      } else if (typeof errorData.message === "string") {
        errorMessage = errorData.message;
      }
    } catch {
      // Si la respuesta no es JSON, mantenemos el mensaje de error por defecto
    }
    throw new Error(errorMessage);
  }

  // 204 No Content → no hay body, no intentar parsear JSON
  if (response.status === 204) {
    return undefined as T;
  }

  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return response.json() as Promise<T>;
  }

  return {} as T;
}
