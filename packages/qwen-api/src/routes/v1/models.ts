import { Context, Hono } from "hono"
import qwenModelList from "../../providers/qwen-api/modelList"
// import blackboxModelList from "../../providers/blackbox/modelList"
import pollinationsModelList from "../../providers/pollinations/modelList"
import hfModelList from "../../providers/HF/modelList"
import g4fModelList from "../../providers/G4F/modelList"
import geminiModelList from "../../providers/Gemini/modelList"
import factoryModelList from "../../providers/factory/modelList"
import zaiModelList from "../../providers/zai/modelList"
import kimiModelList from "../../providers/kimi/modelList"
const modelMaps = {
  // blackbox: blackboxModelList,
  // qwenchatai: qwenModelList,
  pollinations: pollinationsModelList,
  // hf: hfModelList,
  g4f: g4fModelList,
  geminicli: geminiModelList,
  // factory: factoryModelList,
  zai: zaiModelList,
  kimi: kimiModelList,
}
const models = new Hono()
models.get("/", async (c: Context) => {
  const defaultModel = process.env.DEFAULT_MODEL
  const defaultProvider = process.env.DEFAULT_PROVIDER

  const useAllProviders = process.env.USE_ALL_PROVIDER === "true" ? true : false

  console.log({ useAllProviders })

  /*
  const modelList = {
    type: "list",
    data: availableModels.map((model) => {
      const alias = model.alias
      const id = model.id
      return {
        alias,
        id,
        provider: "kimi",
        vision: false,
        audio: false,
      }
    }),
  }
   const kimiModelList: {
    type: string;
    data: {
        alias: string;
        id: string;
        provider: string;
        vision: boolean;
        audio: boolean;
    }[];
}
  */
  console.log("provider", defaultProvider)
  if (useAllProviders) {
    const finalModelList: { type: string; data: any[] } = {
      type: "list",
      data: [],
    }
    const providerKeys = Object.keys(modelMaps)
    for (const providerKey of providerKeys) {
      const currentProviderModels = modelMaps[providerKey as keyof typeof modelMaps].data.filter(
        (m) => typeof m.id !== "undefined"
      )
      for (const availableModel of currentProviderModels) {
        finalModelList.data.push({
          ...availableModel,
          alias: `${providerKey}/${availableModel.id}`,
          id: `${providerKey}/${availableModel.id}`,
        })
      }
    }
    return c.json(finalModelList)
  }
  return c.json(modelMaps[defaultProvider as keyof typeof modelMaps])
})
export default models
