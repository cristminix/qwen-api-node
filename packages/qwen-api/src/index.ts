import v1 from "./providers/qwen-api/routes/v1"
import { serve } from "@hono/node-server"

const port = 3000

serve({
  fetch: v1.fetch,
  port,
})
