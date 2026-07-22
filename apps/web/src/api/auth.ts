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

type MeResponse = {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
};

class AuthAPI {
  public async login(
    username: string,
    password: string
  ): Promise<{ token: string }> {
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

  public async register(payload: RegisterPayload): Promise<{ token: string }> {
    const response = await fetch(`${API_BASE}/api/register/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = (await readJson<LoginResponse & ApiError>(response)) ?? null;

    if (!response.ok) {
      throw new Error(formatApiError(data, "Could not create your account"));
    }

    return { token: data.token };
  }

  public async currentUser(): Promise<MeResponse> {
    return authedRequest<MeResponse>("/api/me/");
  }
}

export const authApi = new AuthAPI();

export function getToken(): string | null {
  return localStorage.getItem("token");
}

export function cleanToken(): void {
  localStorage.removeItem("token");
}

export function setToken(token: string): void {
  localStorage.setItem("token", token);
}

export async function authedRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();

  if (!token) {
    throw new ApiAuthError();
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
      ...options.headers,
    },
  });

  const data = await readJson<T & ApiError>(response);

  if (response.status === 401 || response.status === 403) {
    throw new ApiAuthError(formatApiError(data, "Session expired"));
  }

  if (!response.ok) {
    throw new Error(formatApiError(data, "Request failed"));
  }

  return data as T;
}
