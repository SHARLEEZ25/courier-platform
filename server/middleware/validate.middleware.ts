import type { Context, Next } from "hono";
import { createMiddleware } from "hono/factory";
import type { ZodSchema, z } from "zod";
import { err } from "../types/api.types.js";

declare module "hono" {
  interface ContextVariableMap {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    validatedBody: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    validatedQuery: any;
  }
}

/**
 * Validates the JSON request body against a Zod schema.
 * Stores the parsed result in `c.var.validatedBody`.
 */
export function validateBody<S extends ZodSchema>(schema: S) {
  return createMiddleware(async (c: Context, next: Next) => {
    let body: unknown;
    try {
      body = await c.req.json();
    } catch {
      return c.json(err("Request body must be valid JSON"), 400);
    }

    const result = schema.safeParse(body);
    if (!result.success) {
      console.error("[validate] Validation failed:", JSON.stringify(result.error.flatten(), null, 2));
      return c.json(err("Validation failed", result.error.flatten()), 400);
    }

    c.set("validatedBody", result.data as z.infer<S>);
    await next();
  });
}

/**
 * Validates query string parameters against a Zod schema.
 * Stores the parsed result in `c.var.validatedQuery`.
 */
export function validateQuery<S extends ZodSchema>(schema: S) {
  return createMiddleware(async (c: Context, next: Next) => {
    const raw = c.req.query();
    const result = schema.safeParse(raw);

    if (!result.success) {
      return c.json(err("Invalid query parameters", result.error.flatten()), 400);
    }

    c.set("validatedQuery", result.data as z.infer<S>);
    await next();
  });
}
