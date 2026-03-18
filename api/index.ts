import { handle } from "@hono/node-server/vercel";
import { createApp } from "../server/app.js";

export const config = {
  runtime: "nodejs",
  maxDuration: 30,
};

export default handle(createApp());
