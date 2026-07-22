const API_BASE = "http://127.0.0.1:8000";

type LoginResponse = {
  token: string;
};

type ApiError = {
  non_field_errors?: string[];
};

export async function login(
  username: string,
  password: string
): Promise<LoginResponse> {
  const response = await fetch(`${API_BASE}/api/login/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  const data = (await response.json()) as LoginResponse & ApiError;

  if (!response.ok) {
    throw new Error(data.non_field_errors?.[0] ?? "Login failed");
  }

  return { token: data.token };
}

export function saveToken(token: string): void {
  localStorage.setItem("token", token);
}

export function getToken(): string | null {
  return localStorage.getItem("token");
}

export function clearToken(): void {
  localStorage.removeItem("token");
}
