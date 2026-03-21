import type { Context, Next } from "hono";
import { createMiddleware } from "hono/factory";
import { supabase } from "../config/supabase.js";
import { err } from "../types/api.types.js";
import type { User } from "@supabase/supabase-js";

// Extend Hono context variables with the authed user
declare module "hono" {
  interface ContextVariableMap {
    user: User;
  }
}

/**
 * Requires a valid Supabase Auth JWT.
 * Reads the Bearer token from the Authorization header.
 * Stores the verified user in `c.var.user` for downstream handlers.
 * Returns 401 if token is missing or invalid.
 */
export const requireAuth = createMiddleware(
  async (c: Context, next: Next) => {
    const authHeader = c.req.header("Authorization");
    const token = authHeader?.replace("Bearer ", "").trim();

    if (!token) {
      return c.json(err("Unauthorized"), 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return c.json(err("Unauthorized"), 401);
    }

    c.set("user", user);
    await next();
  }
);
