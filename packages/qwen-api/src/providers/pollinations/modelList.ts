import availableModels from "src/classes/cors-proxy-manager/providers/PollinationsAI/availableModels"

const modelList = {
  type: "list",
  data: availableModels.map((model) => {
    const alias = model.name
    const id = model.aliases
    return {
      alias,
      id,
      provider: "pollinationsai",
      vision: model.vision,
      audio: model.audio,
    }
  }),
}

export default modelList
