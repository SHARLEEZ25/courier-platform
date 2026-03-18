import type { Context, Next } from "hono";
import { createMiddleware } from "hono/factory";
import { getAuth } from "../auth/better-auth.js";
import { err } from "../types/api.types.js";
import type { User } from "../auth/better-auth.js";

// Extend Hono context variables with the authed user
declare module "hono" {
  interface ContextVariableMap {
    user: User;
  }
}

/**
 * Requires a valid BetterAuth session.
 * Stores `session.user` in `c.var.user` for downstream handlers.
 * Returns 401 if no valid session is found.
 */
export const requireAuth = createMiddleware(
  async (c: Context, next: Next) => {
    const session = await getAuth().api.getSession({
      headers: c.req.raw.headers,
    });

    if (!session?.user) {
      return c.json(err("Unauthorized"), 401);
    }

    c.set("user", session.user);
    await next();
  }
);
