const API_BASE = "http://127.0.0.1:8000";

type LoginResponse = {
  token: string;
};

type ApiError = {
  non_field_errors?: string[];
  detail?: string;
  description?: string[];
  category?: string[];
  status?: string[];
};

export type TodoStatus = "pending" | "in_progress" | "done";

export type Todo = {
  id: number;
  user: number;
  description: string;
  status: TodoStatus;
  category: string;
  created_at: string;
  updated_at: string;
};

export type CreateTodoPayload = {
  description: string;
  category: string;
  status: TodoStatus;
};

export class ApiAuthError extends Error {
  constructor(message = "Session expired") {
    super(message);
    this.name = "ApiAuthError";
  }
}

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

async function readJson<T>(response: Response): Promise<T | null> {
  const text = await response.text();

  if (!text) {
    return null;
  }

  return JSON.parse(text) as T;
}

function formatApiError(data: ApiError | null, fallback: string): string {
  return (
    data?.non_field_errors?.[0] ??
    data?.description?.[0] ??
    data?.category?.[0] ??
    data?.status?.[0] ??
    data?.detail ??
    fallback
  );
}

async function authedRequest<T>(
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

export function listTodos(): Promise<Todo[]> {
  return authedRequest<Todo[]>("/api/todos/");
}

export function createTodo(payload: CreateTodoPayload): Promise<Todo> {
  return authedRequest<Todo>("/api/todos/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateTodoStatus(
  id: number,
  status: TodoStatus
): Promise<Todo> {
  return authedRequest<Todo>(`/api/todos/${id}/status/`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
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
