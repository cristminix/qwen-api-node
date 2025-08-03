import app from "./routes"
import { serve } from "@hono/node-server"
import * as dotenv from "dotenv"
dotenv.config()
const port = 3001

serve({
  fetch: app.fetch,
  port,
})
