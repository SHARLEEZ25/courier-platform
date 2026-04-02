import type { Context, Next } from "hono";
import { createMiddleware } from "hono/factory";
import type { DecodedIdToken } from "firebase-admin/auth";
import { getFirebaseAdmin, getAuth } from "../config/firebase-admin.js";
import { err } from "../types/api.types.js";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
}

declare module "hono" {
  interface ContextVariableMap {
    user: AuthUser;
  }
}

/**
 * Requires a valid Firebase ID token in the Authorization header.
 * Verifies via firebase-admin and stores the decoded user in c.var.user.
 */
export const requireAuth = createMiddleware(
  async (c: Context, next: Next) => {
    const authHeader = c.req.header("Authorization");
    const token = authHeader?.replace("Bearer ", "").trim();

    if (!token) {
      return c.json(err("Unauthorized"), 401);
    }

    try {
      const decoded: DecodedIdToken = await getAuth(getFirebaseAdmin()).verifyIdToken(token);

      c.set("user", {
        id: decoded.uid,
        email: decoded.email ?? "",
        name: (decoded.name as string) ?? "",
      });

      await next();
    } catch (e) {
      console.error("[auth] verifyIdToken failed:", e);
      return c.json(err("Unauthorized"), 401);
    }
  }
);
