const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

// Importación lazy para evitar dependencia circular — authService importa fetchApi,
// fetchApi necesita getToken de authService.
function getStoredToken(): string | null {
  return localStorage.getItem("the_food_store_token");
}

export async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_URL}${endpoint}`;

  const token = getStoredToken();

  const defaultHeaders: HeadersInit = {
    "Content-Type": "application/json",
    "Accept": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const response = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });

  if (!response.ok) {
    let errorMessage = "Ocurrió un error en la solicitud";
    try {
      const errorData = await response.json();
      errorMessage = errorData.detail || errorData.message || errorMessage;
    } catch {
      // Si la respuesta no es JSON, mantenemos el mensaje de error por defecto
    }
    throw new Error(errorMessage);
  }

  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return response.json() as Promise<T>;
  }

  return {} as T;
}
