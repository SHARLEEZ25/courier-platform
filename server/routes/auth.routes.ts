// Auth is handled by Firebase on the frontend.
// No server-side auth routes needed — Firebase issues JWTs directly.
// The backend verifies them via server/middleware/auth.middleware.ts
import { Hono } from "hono";

const authRoutes = new Hono();
export default authRoutes;
