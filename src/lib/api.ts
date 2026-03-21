/**
 * Central API client.
 * In development: paths are relative — Vite proxy handles /api → http://localhost:3001.
 * In production: VITE_API_URL points to the backend (e.g. Render service URL).
 */
import { supabase } from "./supabase";

const BASE = import.meta.env.VITE_API_URL ?? "";

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function getAuthHeader(): Promise<Record<string, string>> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) return {};
  return { Authorization: `Bearer ${session.access_token}` };
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const authHeader = await getAuthHeader();

  const res = await fetch(`${BASE}/api${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...authHeader,
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  let json: { ok: boolean; data?: T; error?: string };

  try {
    json = await res.json();
  } catch {
    throw new ApiError("Server returned an invalid response.", res.status);
  }

  if (!json.ok) {
    throw new ApiError(json.error ?? "Request failed.", res.status);
  }

  return json.data as T;
}

export const api = {
  get: <T>(path: string) => request<T>(path),

  post: <T>(path: string, body: unknown) =>
    request<T>(path, {
      method: "POST",
      body: JSON.stringify(body),
    }),
};
