import { availableModels } from "src/classes/cors-proxy-manager/providers/FactoryAI"

const modelList = {
  type: "list",
  data: availableModels.map((model) => {
    const alias = model.alias
    const id = model.id
    return {
      alias,
      id,
      provider: "factory",
      vision: false,
      audio: false,
    }
  }),
}

export default modelList
