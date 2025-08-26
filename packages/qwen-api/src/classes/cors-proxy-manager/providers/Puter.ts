class Puter {
  private defaultModel: string
  private puter: any

  constructor(options: any = {}) {
    this.defaultModel = options.defaultModel || "gpt-4.1"
    this.puter = options.puter || this._injectPuter()
  }

  get chat() {
    return {
      completions: {
        create: async (params: any) => {
          const { messages, ...options } = params
          if (!options.model && this.defaultModel) {
            options.model = this.defaultModel
          }
          if (options.stream) {
            return this._streamCompletion(messages, options)
          }
          const response = await (
            await this.puter
          ).ai.chat(messages, false, options)
          if (response.choices == undefined && response.message !== undefined) {
            return {
              ...response,
              get choices() {
                return [{ message: response.message }]
              },
            }
          } else {
            return response
          }
        },
      },
    }
  }

  get models() {
    return {
      list: async () => {
        const response = await fetch(
          "https://api.puter.com/puterai/chat/models/"
        )
        let models: any = await response.json()
        models = models.models
        const blockList = ["abuse", "costly", "fake", "model-fallback-test-1"]
        models = models.filter(
          (model: string) => !model.includes("/") && !blockList.includes(model)
        )
        return models.map((model: string) => {
          return {
            id: model,
            type: "chat",
          }
        })
      },
    }
  }

  async _injectPuter(): Promise<any> {
    return new Promise((resolve, reject) => {
      if (typeof window === "undefined") {
        reject(new Error("Puter can only be used in a browser environment"))
        return
      }
      if ((window as any).puter) {
        resolve((window as any).puter)
        return
      }
      var tag = document.createElement("script")
      tag.src = "https://js.puter.com/v2/"
      tag.onload = () => {
        resolve((window as any).puter)
      }
      tag.onerror = reject
      var firstScriptTag = document.getElementsByTagName("script")[0]
      if (firstScriptTag.parentNode) {
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag)
      }
    })
  }

  async *_streamCompletion(messages: any, options: any = {}) {
    for await (const item of await (
      await this.puter
    ).ai.chat(messages, false, options)) {
      if (item.choices == undefined && item.text !== undefined) {
        yield {
          ...item,
          get choices() {
            return [{ delta: { content: item.text } }]
          },
        }
      } else {
        yield item
      }
    }
  }
}

export { Puter }
export default Puter
