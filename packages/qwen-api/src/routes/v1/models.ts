import { Context, Hono } from "hono"
import qwenModelList from "../../providers/qwen-api/modelList"
import blackboxModelList from "../../providers/blackbox/modelList"
import pollinationsModelList from "../../providers/pollinations/modelList"
const modelMaps = {
  blackbox: blackboxModelList,
  qwenchatai: qwenModelList,
  pollinations: pollinationsModelList,
}
const defaultModel = process.env.DEFAULT_MODEL
const models = new Hono()
models.get("/", async (c: Context) => {
  const defaultProvider = process.env.DEFAULT_PROVIDER

  console.log("provider", defaultProvider)
  return c.json(modelMaps[defaultProvider as keyof typeof modelMaps])
})
export default models
