import qwenModelList from "../../../providers/qwen-api/modelList"
import blackboxModelList from "../../../providers/blackbox/modelList"
import pollinationsModelList from "../../../providers/pollinations/modelList"

const modelMaps = {
  blackbox: blackboxModelList,
  qwenchatai: qwenModelList,
  pollinations: pollinationsModelList,
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
  return defaultModel
}
