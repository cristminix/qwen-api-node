import { Client } from "../Client"
import availableModels from "./PollinationsAI/availableModels"
import availableModelsOld from "./PollinationsAI/availableModelsOld"

class PollinationsAI extends Client {
  availableModels = availableModels
  availableModels_old = availableModelsOld

  constructor(options: any = {}) {
    super({
      baseUrl: "https://text.pollinations.ai",
      apiEndpoint: "https://text.pollinations.ai/openai",
      imageEndpoint: "https://image.pollinations.ai/prompt/{prompt}",
      defaultModel: "gpt-oss",
      referrer: "https://g4f.dev",
      modelAliases: {
        "gpt-oss-120b": "gpt-oss",
        "gpt-4o-mini": "openai",
        "gpt-4.1-nano": "openai-fast",
        "gpt-4.1": "openai-large",
        "o4-mini": "openai-reasoning",
        "command-r-plus": "command-r",
        "gemini-2.5-flash": "gemini",
        "gemini-2.0-flash-thinking": "gemini-thinking",
        "qwen-2.5-coder-32b": "qwen-coder",
        "llama-3.3-70b": "llama",
        "llama-4-scout": "llamascout",
        "mistral-small-3.1-24b": "mistral",
        "deepseek-r1": "deepseek-reasoning",
        "phi-4": "phi",
        "deepseek-v3": "deepseek",
        "grok-3-mini-high": "grok",
        "gpt-4o-audio": "openai-audio",
        "sdxl-turbo": "turbo",
        "gpt-image": "gptimage",
        "flux-kontext": "kontext",
      },
      ...options,
    })
  }

  get models() {
    return {
      list: async () => {
        if (this._models.length > 0) return this._models
        try {
          let [textModelsResponse, imageModelsResponse] = await Promise.all([
            this._fetchWithProxyRotation(
              "https://text.pollinations.ai/models"
            ).catch((e) => {
              console.error("Failed to fetch text models from all proxies:", e)
              return { data: [] }
            }),
            this._fetchWithProxyRotation(
              "https://image.pollinations.ai/models"
            ).catch((e) => {
              console.error("Failed to fetch image models from all proxies:", e)
              return []
            }),
          ])
          if ("json" in textModelsResponse) {
            textModelsResponse = await textModelsResponse.json()
          }
          if ("json" in imageModelsResponse) {
            imageModelsResponse = await imageModelsResponse.json()
          }
          const textModels =
            (textModelsResponse as any).data || textModelsResponse || []
          this._models = [
            ...textModels.map((model: any) => {
              model.id = model.id || this.swapAliases[model.name] || model.name
              model.type = model.type || "chat"
              return model
            }),
            ...(Array.isArray(imageModelsResponse)
              ? imageModelsResponse
              : []
            ).map((model: any) => {
              return { id: this.swapAliases[model] || model, type: "image" }
            }),
          ]
          return this._models
        } catch (err) {
          console.error("Final fallback for Pollinations models:", err)
          return [
            { id: "gpt-4.1-mini", type: "chat" },
            { id: "deepseek-v3", type: "chat" },
            { id: "flux", type: "image" },
            { id: "gpt-image", type: "image" },
          ]
        }
      },
    }
  }
}

export { PollinationsAI }
export default PollinationsAI