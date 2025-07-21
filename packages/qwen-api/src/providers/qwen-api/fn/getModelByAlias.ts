import modelList from "../modelList"

export function getModelByAlias(modelAlias: string) {
  const filtered = modelList.data.filter((model) => {
    return model.id === modelAlias
  })
  if (filtered.length > 0) {
    const [selectedModel] = filtered
    return selectedModel.alias
  }
  return "qwen-max-latest"
}
