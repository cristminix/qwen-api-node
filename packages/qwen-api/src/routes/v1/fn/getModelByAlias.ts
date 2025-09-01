import qwenModelList from "../../../providers/qwen-api/modelList"
import blackboxModelList from "../../../providers/blackbox/modelList"
import pollinationsModelList from "../../../providers/pollinations/modelList"
import hfModelList from "../../../providers/HF/modelList"
import g4fModelList from "../../../providers/G4F/modelList"
import geminiModelList from "../../../providers/Gemini/modelList"
const modelMaps = {
  blackbox: blackboxModelList,
  qwenchatai: qwenModelList,
  pollinations: pollinationsModelList,
  hf: hfModelList,
  g4f: g4fModelList,
  geminicli: geminiModelList,
}
const defaultModel = process.env.DEFAULT_MODEL

export function getModelByAlias(provider: string, modelAlias: string) {
  // console.log("getModelByAlias", provider, modelAlias)
  const filtered = modelMaps[provider].data.filter((model) => {
    return model.id === modelAlias
  })
  if (filtered.length > 0) {
    const [selectedModel] = filtered
    return selectedModel.alias
  }
  return modelAlias
}
