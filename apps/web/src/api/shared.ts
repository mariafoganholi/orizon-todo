import { ApiAuthError, getToken } from "./auth";

export const API_BASE = "http://127.0.0.1:8000";

export type ApiError = {
  non_field_errors?: string[];
  detail?: string;
  username?: string[];
  email?: string[];
  first_name?: string[];
  last_name?: string[];
  password?: string[];
  description?: string[];
  category?: string[];
  status?: string[];
};

export async function readJson<T>(response: Response): Promise<T | null> {
  const text = await response.text();

  if (!text) {
    return null;
  }

  return JSON.parse(text) as T;
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

export function formatApiError(
  data: ApiError | null,
  fallback: string
): string {
  return (
    data?.non_field_errors?.[0] ??
    data?.username?.[0] ??
    data?.email?.[0] ??
    data?.first_name?.[0] ??
    data?.last_name?.[0] ??
    data?.password?.[0] ??
    data?.description?.[0] ??
    data?.category?.[0] ??
    data?.status?.[0] ??
    data?.detail ??
    fallback
  );
}
