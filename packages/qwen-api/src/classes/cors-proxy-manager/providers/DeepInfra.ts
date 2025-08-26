import { Client } from "../Client"

class DeepInfra extends Client {
  constructor(options: any = {}) {
    super({
      baseUrl: "https://api.deepinfra.com/v1/openai",
      defaultModel: "deepseek-ai/DeepSeek-V3-0324",
      ...options,
    })
  }
}

export { DeepInfra }
export default DeepInfra
