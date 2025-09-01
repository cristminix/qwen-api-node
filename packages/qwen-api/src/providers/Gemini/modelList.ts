import { availableModels } from "src/classes/cors-proxy-manager/providers/GeminiCli"

const modelList = {
  type: "list",
  data: availableModels.map((model) => {
    const alias = model.id
    const id = model.id
    return {
      alias,
      id,
      provider: "geminicli",
    }
  }),
}

export default modelList
