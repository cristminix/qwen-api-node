import { Context, Hono } from "hono"
import modelList from "../../modelList"

const models = new Hono()
models.get("/", async (c: Context) => {
  return c.json(modelList)
})
export default models
