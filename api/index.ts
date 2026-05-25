import { handle } from "@hono/node-server/vercel";
import { createApp } from "../backend/app.js";

export const config = {
  runtime: "nodejs",
  maxDuration: 60,
};

export default handle(createApp());
