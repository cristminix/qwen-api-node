import { Context, Next } from "hono"
import { cors } from "hono/cors"
import * as dotenv from "dotenv"

function applyHonoCors(app: any) {
  app.use("*", (c: Context, next: Next) => {
    let origins: string[] = []
    let allowedOrigins = c.env.ALLOWED_ORIGINS ?? process.env.ALLOWED_ORIGINS
    if (!allowedOrigins) {
      allowedOrigins = "*"
    }
    if (c.env.ALLOWED_ORIGINS == "*") {
      origins = ["*"]
    } else {
      origins = allowedOrigins.split(",")
    }

    const corsMiddleware = cors({
      origin: origins,
      credentials: true,
    })
    return corsMiddleware(c, next)
  })
}
export default applyHonoCors
