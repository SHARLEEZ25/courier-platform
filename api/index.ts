import { handle } from "hono/vercel";
import { createApp } from "../dist/server/app.js";

export const config = {
  runtime: "nodejs",
  maxDuration: 30,
};

export default handle(createApp());
