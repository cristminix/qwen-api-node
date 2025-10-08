import { availableModels } from "src/classes/cors-proxy-manager/providers/zai/availableModels"

const modelList = {
  type: "list",
  data: availableModels.map((model) => {
    const alias = model.id
    const id = model.alias
    return {
      alias,
      id,
      provider: "zai",
      vision: false,
      audio: false,
    }
  }),
}

export default modelList
