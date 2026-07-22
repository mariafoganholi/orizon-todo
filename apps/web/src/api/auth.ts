import { API_BASE, formatApiError, readJson, type ApiError } from "./shared";

export class ApiAuthError extends Error {
  constructor(message = "Session expired") {
    super(message);
    this.name = "ApiAuthError";
  }
}

type LoginResponse = {
  token: string;
};

export type RegisterPayload = {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  password: string;
};

type RegisterResponse = LoginResponse & {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
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

export async function register(
  payload: RegisterPayload
): Promise<RegisterResponse> {
  const response = await fetch(`${API_BASE}/api/register/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = (await readJson<RegisterResponse & ApiError>(response)) ?? null;

  if (!response.ok) {
    throw new Error(formatApiError(data, "Could not create your account"));
  }

  return data as RegisterResponse;
}

export function getToken(): string | null {
  return localStorage.getItem("token");
}

export function clearToken(): void {
  localStorage.removeItem("token");
}

export function saveToken(token: string): void {
  localStorage.setItem("token", token);
}
