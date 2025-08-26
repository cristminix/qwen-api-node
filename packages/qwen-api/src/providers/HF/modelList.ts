import availableModels from "src/classes/cors-proxy-manager/providers/HuggingFace/availableModels"

const modelList = {
  type: "list",
  data: availableModels.map((model) => {
    const alias = model.id
    const id = model.id
    return {
      alias,
      id,
      provider: "huggingface",
    }
  }),
}

export default modelList
