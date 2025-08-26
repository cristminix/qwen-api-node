import { CorsProxyManager } from "./CorsProxyManager"

export class Client {
  protected proxyManager: CorsProxyManager
  protected baseUrl: string
  protected apiEndpoint: string
  protected imageEndpoint: string
  protected defaultModel: string | null
  protected defaulImageModel: string
  protected apiKey: string | undefined
  protected referrer: string | undefined
  protected extraHeaders: Record<string, string>
  protected modelAliases: Record<string, string | string[]>
  protected swapAliases: Record<string, string>
  protected _models: any[]

  constructor(options: any = {}) {
    if (!options.baseUrl && !options.apiEndpoint && !options.apiKey) {
      if (localStorage && localStorage.getItem("Azure-api_key")) {
        options.apiKey = localStorage.getItem("Azure-api_key")
      } else {
        throw new Error(
          "Client requires at least baseUrl, apiEndpoint, or apiKey to be set."
        )
      }
    }

    // Create CorsProxyManager with useProxyRotation option
    this.proxyManager = new CorsProxyManager(
      options.proxies, // Pass proxies array if provided
      options.useProxyRotation !== undefined ? options.useProxyRotation : true // Default to true
    )

    this.baseUrl = options.baseUrl || "https://host.g4f.dev/api/Azure"
    this.apiEndpoint = options.apiEndpoint || `${this.baseUrl}/chat/completions`
    this.imageEndpoint =
      options.imageEndpoint || `${this.baseUrl}/images/generations`
    this.defaultModel = options.defaultModel || null
    this.defaulImageModel = options.defaultImageModel || "flux"
    this.apiKey = options.apiKey
    this.referrer = options.referrer

    this.extraHeaders = {
      "Content-Type": "application/json",
      ...(this.apiKey ? { Authorization: `Bearer ${this.apiKey}` } : {}),
      ...(options.extraHeaders || {}),
    }

    this.modelAliases = options.modelAliases || {}
    this.swapAliases = {}
    Object.keys(this.modelAliases).forEach((key) => {
      if (typeof this.modelAliases[key] === "string") {
        this.swapAliases[this.modelAliases[key] as string] = key
      }
    })

    // Caching for models
    this._models = []
  }

  async _fetchWithProxyRotation(
    targetUrl: string,
    requestConfig: RequestInit = {}
  ): Promise<Response> {
    const maxAttempts = this.proxyManager.proxies.length
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const proxiedUrl = this.proxyManager.getProxiedUrl(targetUrl)
      try {
        const response = await fetch(proxiedUrl, requestConfig)
        if (!response.ok) {
          throw new Error(`Proxy fetch failed with status ${response.status}`)
        }
        const contentType = response.headers.get("Content-Type")
        if (contentType && !contentType.includes("application/json")) {
          throw new Error(`Expected JSON response, got ${contentType}`)
        }
        return response
      } catch (error) {
        console.warn(
          `CORS proxy attempt ${
            attempt + 1
          }/${maxAttempts} failed for ${targetUrl}:`,
          (error as Error).message
        )
        this.proxyManager.rotateProxy()
      }
    }
    throw new Error(`All CORS proxy attempts failed for ${targetUrl}.`)
  }

  get chat() {
    return {
      completions: {
        create: async (
          params: any,
          requestOption: any = {},
          direct = false
        ) => {
          let modelId = params.model || this.defaultModel
          if (this.modelAliases[modelId]) {
            modelId = this.modelAliases[modelId]
          }
          params.model = modelId
          if (this.referrer) {
            params.referrer = this.referrer
          }
          const requestOptions = {
            method: "POST",
            headers: this.extraHeaders,
            body: JSON.stringify(params),
            ...requestOption,
          }
          const response = await fetch(this.apiEndpoint, requestOptions)
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

  get models() {
    return {
      list: async () => {
        const response = await fetch(`${this.baseUrl}/models`, {
          method: "GET",
          headers: this.extraHeaders,
        })

        if (!response.ok) {
          throw new Error(`Failed to fetch models: ${response.status}`)
        }

        let data = await response.json()
        data = data.data || data
        data = data.map((model: any) => {
          if (!model.type) {
            if (model.supports_chat) {
              model.type = "chat"
            } else if (model.supports_images) {
              model.type = "image"
            } else if (model.image) {
              model.type = "image"
            }
            return model
          }
        })
        return data
      },
    }
  }

  get images() {
    return {
      generate: async (params: any) => {
        let modelId = params.model || this.defaulImageModel
        if (this.modelAliases[modelId]) {
          modelId = this.modelAliases[modelId]
        }
        params.model = modelId

        if (this.imageEndpoint.includes("{prompt}")) {
          return this._defaultImageGeneration(params, {
            headers: this.extraHeaders,
          })
        }
        return this._regularImageGeneration(params, {
          headers: this.extraHeaders,
        })
      },
    }
  }

  async _regularCompletion(response: Response) {
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`)
    }
    return await response.json()
  }

  async *_streamCompletion(response: Response) {
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`)
    }
    if (!response.body) {
      throw new Error("Streaming not supported in this environment")
    }
    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ""
    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const parts = buffer.split("\n")
        buffer = parts.pop() || ""
        for (const part of parts) {
          if (!part.trim() || part === "data: [DONE]") continue
          try {
            if (part.startsWith("data: ")) {
              const data = JSON.parse(part.slice(6))
              if (data.choices && data.choices[0]?.delta?.reasoning) {
                data.choices[0].delta.reasoning_content =
                  data.choices[0].delta.reasoning
              }
              yield data
            }
          } catch (err) {
            console.error("Error parsing chunk:", part, err)
          }
        }
      }
    } finally {
      reader.releaseLock()
    }
  }

  async _defaultImageGeneration(params: any, requestOptions: any) {
    params = { ...params }
    let prompt = params.prompt ? params.prompt : ""
    prompt = encodeURIComponent(prompt).replace(/%20/g, "+")
    delete params.prompt
    if (params.nologo === undefined) params.nologo = true
    if (this.referrer) params.referrer = this.referrer
    if (params.size) {
      params.width = params.size.split("x")[0]
      params.height = params.size.split("x")[1]
      delete params.size
    }
    const encodedParams = new URLSearchParams(params)
    let url = this.imageEndpoint.replace("{prompt}", prompt)
    url += "?" + encodedParams.toString()
    const response = await fetch(url, requestOptions)
    if (!response.ok) {
      throw new Error(
        `Image generation request failed with status ${response.status}`
      )
    }
    return { data: [{ url: response.url }] }
  }

  async _regularImageGeneration(params: any, requestOptions: any) {
    const response = await fetch(this.imageEndpoint, {
      method: "POST",
      body: JSON.stringify(params),
      ...requestOptions,
    })
    if (!response.ok) {
      const errorBody = await response.text()
      console.error("Image generation failed. Server response:", errorBody)
      throw new Error(
        `Image generation request failed with status ${response.status}`
      )
    }
    const data = await response.json()
    if (data?.error?.message) {
      throw new Error(`Image generation failed: ${data.error.message}`)
    }
    return data
  }
}
