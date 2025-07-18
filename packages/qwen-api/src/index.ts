import app from "./routes/openai";
import { serve } from '@hono/node-server'

const port = 3000

serve({
  fetch: app.fetch,
  port
})