import { models } from "../qwen-models"

export function getModelByAlias(modelAlias: string) {
  const filtered = models.data.filter((model) => {
    return model.id === modelAlias
  })
  if (filtered.length > 0) {
    const [selectedModel] = filtered
    return selectedModel.alias
  }
  return ""
}
