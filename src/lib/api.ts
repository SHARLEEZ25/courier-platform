/**
 * Central API client.
 * All paths are relative — Vite dev proxy handles /api → http://localhost:3001.
 * In production, the server serves /api on the same origin.
 */

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    credentials: "include", // send session cookie for auth-required endpoints
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
