import { Client } from "../Client"
import availableModels from "./HuggingFace/availableModels"

class HuggingFace extends Client {
  private providerMapping: Record<string, any>
  availableModels = availableModels
  constructor(options: any = {}) {
    if (!options.apiKey) {
      if (typeof process !== "undefined" && process.env.HUGGINGFACE_API_KEY) {
        options.apiKey = process.env.HUGGINGFACE_API_KEY
      } else if (
        typeof localStorage !== "undefined" &&
        localStorage.getItem("HuggingFace-api_key")
      ) {
        options.apiKey = localStorage.getItem("HuggingFace-api_key")
      } else {
        throw new Error(
          "HuggingFace API key is required. Set it in the options or as an environment variable HUGGINGFACE_API_KEY."
        )
      }
    }
    super({
      baseUrl: "https://api-inference.huggingface.co/v1",
      defaultModel: "meta-llama/Meta-Llama-3-8B-Instruct",
      modelAliases: {
        // Chat //
        "llama-3": "meta-llama/Llama-3.3-70B-Instruct",
        "llama-3.3-70b": "meta-llama/Llama-3.3-70B-Instruct",
        "command-r-plus": "CohereForAI/c4ai-command-r-plus-08-2024",
        "deepseek-r1": "deepseek-ai/DeepSeek-R1",
        "deepseek-v3": "deepseek-ai/DeepSeek-V3",
        "qwq-32b": "Qwen/QwQ-32B",
        "nemotron-70b": "nvidia/Llama-3.1-Nemotron-70B-Instruct-HF",
        "qwen-2.5-coder-32b": "Qwen/Qwen2.5-Coder-32B-Instruct",
        "llama-3.2-11b": "meta-llama/Llama-3.2-11B-Vision-Instruct",
        "mistral-nemo": "mistralai/Mistral-Nemo-Instruct-2407",
        "phi-3.5-mini": "microsoft/Phi-3.5-mini-instruct",
        "gemma-3-27b": "google/gemma-3-27b-it",
        // Image //
        flux: "black-forest-labs/FLUX.1-dev",
        "flux-dev": "black-forest-labs/FLUX.1-dev",
        "flux-schnell": "black-forest-labs/FLUX.1-schnell",
        "stable-diffusion-3.5-large": "stabilityai/stable-diffusion-3.5-large",
        "sdxl-1.0": "stabilityai/stable-diffusion-xl-base-1.0",
        "sdxl-turbo": "stabilityai/sdxl-turbo",
        "sd-3.5-large": "stabilityai/stable-diffusion-3.5-large",
      },
      ...options,
    })
    this.providerMapping = {
      "google/gemma-3-27b-it": {
        "hf-inference/models/google/gemma-3-27b-it": {
          task: "conversational",
          providerId: "google/gemma-3-27b-it",
        },
      },
    }
  }

  get models() {
    return {
      list: async () => {
        const response = await fetch(
          "https://huggingface.co/api/models?inference=warm&&expand[]=inferenceProviderMapping"
        )
        if (!response.ok) {
          throw new Error(`Failed to fetch models: ${response.status}`)
        }
        const data: any = await response.json()
        return data
          .filter((model: any) =>
            model.inferenceProviderMapping?.some(
              (provider: any) =>
                provider.status === "live" && provider.task === "conversational"
            )
          )
          .concat(
            Object.keys(this.providerMapping).map((model: string) => ({
              id: model,
              type: "chat",
            }))
          )
      },
    }
  }

  async _getMapping(model: string) {
    if (this.providerMapping[model]) {
      return this.providerMapping[model]
    }
    const response = await fetch(
      `https://huggingface.co/api/models/${model}?expand[]=inferenceProviderMapping`,
      {
        headers: this.extraHeaders,
      }
    )

    if (!response.ok) {
      throw new Error(`Failed to fetch model mapping: ${response.status}`)
    }

    const modelData: any = await response.json()
    this.providerMapping[model] = modelData.inferenceProviderMapping
    return this.providerMapping[model]
  }

  get chat() {
    return {
      completions: {
        create: async (
          params: any,
          requestOption: any = {},
          direct = false
        ) => {
          let { model, ...options } = params

          if (!model) {
            model = this.defaultModel
          }
          if (model && this.modelAliases[model]) {
            model = this.modelAliases[model] as string
          }

          // Model resolution would go here
          const providerMapping = await this._getMapping(model as string)
          if (!providerMapping) {
            throw new Error(`Model is not supported: ${model}`)
          }

          let apiBase = ""
          for (const providerKey in providerMapping) {
            let apiPath = ""
            if (providerKey === "novita") apiPath = "novita/v3/openai"
            else if (providerKey === "hf-inference")
              apiPath = `${providerKey}/models/${model}/v1`
            else apiPath = `${providerKey}/v1`
            apiBase = `https://router.huggingface.co/${apiPath}`

            const task = providerMapping[providerKey].task
            if (task !== "conversational") {
              throw new Error(`Model is not supported: ${model} task: ${task}`)
            }

            model = providerMapping[providerKey].providerId
            break
          }

          const requestOptions = {
            method: "POST",
            headers: this.extraHeaders,
            body: JSON.stringify({
              model,
              ...options,
            }),
            ...requestOption,
          }
          const response = await fetch(
            `${apiBase}/chat/completions`,
            requestOptions
          )
          if (params.stream) {
            if (direct) return response
            return this._streamCompletion(response)
          } else {
            return this._regularCompletion(response)
          }
        },
      },
    }
  }
}

export { HuggingFace }
export default HuggingFace
