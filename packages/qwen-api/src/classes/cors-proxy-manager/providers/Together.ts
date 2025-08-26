import { Client } from "../Client"

class Together extends Client {
  private modelsEndpoint: string
  private _modelConfigs: Record<string, any>
  private _cachedModels: any[]

  constructor(options: any = {}) {
    if (!options.baseUrl && !options.apiEndpoint && !options.apiKey) {
      if (localStorage && localStorage.getItem("Together-api_key")) {
        options.apiKey = localStorage.getItem("Together-api_key")
      } else {
        throw new Error('Together requires a "apiKey" to be set.')
      }
    }
    super({
      baseUrl: "https://api.together.xyz/v1",
      defaultModel: "meta-llama/Llama-4-Maverick-17B-128E-Instruct-FP8",
      defaulImageModel: "black-forest-labs/FLUX.1.1-pro",
      modelAliases: {
        // Models Chat/Language
        // meta-llama
        "llama-3.2-3b": "meta-llama/Llama-3.2-3B-Instruct-Turbo",
        "llama-2-70b": [
          "meta-llama/Llama-2-70b-hf",
          "meta-llama/Llama-2-70b-hf",
        ],
        "llama-3-70b": [
          "meta-llama/Meta-Llama-3-70B-Instruct-Turbo",
          "meta-llama/Llama-3-70b-chat-hf",
        ],
        "llama-3.2-90b": "meta-llama/Llama-3.2-90B-Vision-Instruct-Turbo",
        "llama-3.3-70b": [
          "meta-llama/Llama-3.3-70B-Instruct-Turbo",
          "meta-llama/Llama-3.3-70B-Instruct-Turbo-Free",
        ],
        "llama-4-scout": "meta-llama/Llama-4-Scout-17B-16E-Instruct",
        "llama-3.1-8b": [
          "meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo",
          "blackbox/meta-llama-3-1-8b",
        ],
        "llama-3.2-11b": "meta-llama/Llama-3.2-11B-Vision-Instruct-Turbo",
        "llama-3-8b": [
          "meta-llama/Llama-3-8b-chat-hf",
          "meta-llama/Meta-Llama-3-8B-Instruct-Lite",
        ],
        "llama-3.1-70b": ["meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo"],
        "llama-3.1-405b": "meta-llama/Meta-Llama-3.1-405B-Instruct-Turbo",
        "llama-4-maverick": "meta-llama/Llama-4-Maverick-17B-128E-Instruct-FP8",

        // deepseek-ai
        "deepseek-r1": "deepseek-ai/DeepSeek-R1",
        "deepseek-v3": [
          "deepseek-ai/DeepSeek-V3",
          "deepseek-ai/DeepSeek-V3-p-dp",
        ],
        "deepseek-r1-distill-llama-70b": [
          "deepseek-ai/DeepSeek-R1-Distill-Llama-70B",
          "deepseek-ai/DeepSeek-R1-Distill-Llama-70B-free",
        ],
        "deepseek-r1-distill-qwen-1.5b":
          "deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B",
        "deepseek-r1-distill-qwen-14b":
          "deepseek-ai/DeepSeek-R1-Distill-Qwen-14B",

        // Qwen
        "qwen-2.5-vl-72b": "Qwen/Qwen2.5-VL-72B-Instruct",
        "qwen-2.5-coder-32b": "Qwen/Qwen2.5-Coder-32B-Instruct",
        "qwen-2.5-7b": "Qwen/Qwen2.5-7B-Instruct-Turbo",
        "qwen-2-vl-72b": "Qwen/Qwen2-VL-72B-Instruct",
        "qwq-32b": "Qwen/QwQ-32B",
        "qwen-2.5-72b": "Qwen/Qwen2.5-72B-Instruct-Turbo",
        "qwen-3-235b": [
          "Qwen/Qwen3-235B-A22B-fp8",
          "Qwen/Qwen3-235B-A22B-fp8-tput",
        ],
        "qwen-2-72b": "Qwen/Qwen2-72B-Instruct",

        // mistralai
        "mixtral-8x7b": "mistralai/Mixtral-8x7B-Instruct-v0.1",
        "mistral-small-24b": "mistralai/Mistral-Small-24B-Instruct-2501",
        "mistral-7b": [
          "mistralai/Mistral-7B-Instruct-v0.1",
          "mistralai/Mistral-7B-Instruct-v0.2",
          "mistralai/Mistral-7B-Instruct-v0.3",
        ],

        // google
        "gemma-2-27b": "google/gemma-2-27b-it",

        // nvidia
        "nemotron-70b": "nvidia/Llama-3.1-Nemotron-70B-Instruct-HF",

        // NousResearch
        "hermes-2-dpo": "NousResearch/Nous-Hermes-2-Mixtral-8x7B-DPO",

        // perplexity-ai
        "r1-1776": "perplexity-ai/r1-1776",

        // Models Image
        // black-forest-labs
        flux: [
          "black-forest-labs/FLUX.1-schnell-Free",
          "black-forest-labs/FLUX.1-schnell",
          "black-forest-labs/FLUX.1.1-pro",
          "black-forest-labs/FLUX.1-pro",
          "black-forest-labs/FLUX.1-dev",
        ],
        "flux-schnell": [
          "black-forest-labs/FLUX.1-schnell-Free",
          "black-forest-labs/FLUX.1-schnell",
        ],
        "flux-pro": [
          "black-forest-labs/FLUX.1.1-pro",
          "black-forest-labs/FLUX.1-pro",
        ],
        "flux-redux": "black-forest-labs/FLUX.1-redux",
        "flux-depth": "black-forest-labs/FLUX.1-depth",
        "flux-canny": "black-forest-labs/FLUX.1-canny",
        "flux-kontext-max": "black-forest-labs/FLUX.1-kontext-max",
        "flux-dev-lora": "black-forest-labs/FLUX.1-dev-lora",
        "flux-dev": [
          "black-forest-labs/FLUX.1-dev",
          "black-forest-labs/FLUX.1-dev-lora",
        ],
        "flux-kontext-pro": "black-forest-labs/FLUX.1-kontext-pro",

        ...options.modelAliases,
      },
      ...options,
    })

    this.modelsEndpoint = "https://api.together.xyz/v1/models"
    this._modelConfigs = {}
    this._cachedModels = []
  }

  _getModel(model: string | null, defaultModel: string | null): string {
    if (!model) {
      model = defaultModel
    }

    if (model && this.modelAliases[model]) {
      const alias = this.modelAliases[model]
      if (Array.isArray(alias)) {
        const selected = alias[Math.floor(Math.random() * alias.length)]
        console.log(
          `Together: Selected model '${selected}' from alias '${model}'`
        )
        return selected
      }
      console.log(`Together: Using model '${alias}' for alias '${model}'`)
      return alias as string
    }

    return model || ""
  }

  _getModelConfig(model: string) {
    return this._modelConfigs[model] || {}
  }

  async _loadModels(): Promise<any[]> {
    if (this._cachedModels.length > 0) {
      return this._cachedModels
    }

    try {
      // await this.getApiKey() // Method not implemented

      const response = await fetch(this.modelsEndpoint, {
        method: "GET",
        headers: this.extraHeaders,
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch models: ${response.status}`)
      }

      const modelsData = await response.json()

      this._cachedModels = modelsData
      this._modelConfigs = {}

      for (const model of modelsData) {
        if (!model?.id) continue
        const modelId = model.id
        if (model.config) {
          this._modelConfigs[modelId] = {
            stop: model.config.stop || [],
            chatTemplate: model.config.chat_template,
            bosToken: model.config.bos_token,
            eosToken: model.config.eos_token,
            contextLength: model.context_length,
          }
        } else {
          this._modelConfigs[modelId] = {}
        }
      }
      return this._cachedModels
    } catch (error) {
      console.error("Failed to load Together models:", error)
      return this._cachedModels
    }
  }

  async _regularImageGeneration(params: any, requestOptions: any) {
    if (params.image) {
      params.image_url = params.image
      delete params.image
    }
    return await super._regularImageGeneration(params, requestOptions)
  }

  get models() {
    return {
      list: async () => {
        return await this._loadModels()
      },
    }
  }

  get chat() {
    return {
      completions: {
        create: async (params: any) => {
          if (this._cachedModels.length < 1) {
            await this._loadModels()
          }

          params.model = this._getModel(params.model, this.defaultModel)

          const modelConfig = this._getModelConfig(params.model)
          if (!params.stop && modelConfig.stop && modelConfig.stop.length > 0) {
            params.stop = modelConfig.stop
          }

          const requestOptions = {
            method: "POST",
            headers: {
              ...this.extraHeaders,
              Authorization: `Bearer ${this.apiKey}`,
            },
            body: JSON.stringify(params),
          }
          const response = await fetch(this.apiEndpoint, requestOptions)
          if (params.stream) {
            return this._streamCompletion(response)
          } else {
            return this._regularCompletion(response)
          }
        },
      },
    }
  }

  get images() {
    return {
      generate: async (params: any) => {
        if (this._cachedModels.length < 1) {
          await this._loadModels()
        }
        params.model = this._getModel(params.model, this.defaulImageModel)
        return this._regularImageGeneration(params, {
          headers: this.extraHeaders,
        })
      },
    }
  }
}

export { Together }
export default Together
