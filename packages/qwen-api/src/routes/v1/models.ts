import { Context, Hono } from "hono"
import qwenModelList from "../../providers/qwen-api/modelList"
import blackboxModelList from "../../providers/blackbox/modelList"
import pollinationsModelList from "../../providers/pollinations/modelList"
import hfModelList from "../../providers/HF/modelList"
import g4fModelList from "../../providers/G4F/modelList"
import geminiModelList from "../../providers/Gemini/modelList"
import factoryModelList from "../../providers/factory/modelList"
import zaiModelList from "../../providers/zai/modelList"
import kimiModelList from "../../providers/kimi/modelList"
const modelMaps = {
  blackbox: blackboxModelList,
  qwenchatai: qwenModelList,
  pollinations: pollinationsModelList,
  hf: hfModelList,
  g4f: g4fModelList,
  geminicli: geminiModelList,
  factory: factoryModelList,
  zai: zaiModelList,
  kimi: kimiModelList,
}
const defaultModel = process.env.DEFAULT_MODEL
const models = new Hono()
models.get("/", async (c: Context) => {
  const defaultProvider = process.env.DEFAULT_PROVIDER

  console.log("provider", defaultProvider)
  return c.json(modelMaps[defaultProvider as keyof typeof modelMaps])
})
export default models
