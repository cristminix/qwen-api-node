import { Hono } from "hono"

export default function createHono() {
  const app = new Hono()
  return app
}
