import { serve } from "@hono/node-server";
import { createApp } from "./app.js";
import { env } from "./config/env.js";

const app = createApp();

serve(
  {
    fetch: app.fetch,
    port: env.PORT,
  },
  (info) => {
    console.log(`\n🚀 Uniex API server running on http://localhost:${info.port}`);
    console.log(`   Environment : ${env.NODE_ENV}`);
    console.log(`   Frontend URL: ${env.FRONTEND_URL}`);
    console.log(`   Health check: http://localhost:${info.port}/health\n`);
  }
);
