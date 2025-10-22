import { getAuthFromCache, saveAuthToCache, getAuthToken } from "./getAuthToken"
import { getModelsFromCache, saveModelsToCache, getModels } from "./getModels"

/**
 * Get authentication and models data for ZAI API
 * @param url - Base URL for the API
 * @param defaultModel - Default model to use if no models are available
 * @returns Promise resolving to the list of available models
 */
export async function getAuthAndModels(
  defaultModel?: string
): Promise<[string[], string | null, string | null, Record<string, string>]> {
  let models: string[] = []
  let apiKey: string | null = null
  let authUserId: string | null = null
  let modelAliases: Record<string, string> = {}

  try {
    // Get authentication data
    let responseJson = null//getAuthFromCache()
    if (responseJson === null) {
      responseJson = await getAuthToken()
      console.log(`GLM auth response: success`)
      saveAuthToCache(responseJson)
    } else {
      console.log("auth loaded from cache")
    }

    if (responseJson !== null) {
      apiKey = responseJson.token
      authUserId = responseJson.id
    }

    // Get models if we have an API key
    if (apiKey !== null) {
      let data = await getModelsFromCache()
      if (data === null) {
        const modelsResponse = await getModels(apiKey)
        data = modelsResponse.data || []
        await saveModelsToCache(data)
      } else {
        console.log("models loaded from cache")
        // console.log(data)
      }

      if (data !== null) {
        modelAliases = {}
        for (const item of data) {
          const name = (item.name || "").replace(
            "\u4efb\u52a1\u4e13\u7528",
            "ChatGLM"
          )
          const id = item.id
          if (name && id) {
            modelAliases[name] = id
          }
        }
        models = Object.keys(modelAliases)
      }
    }
  } catch (error) {
    console.error(`Error fetching GLM models: ${error}`)
    // Return default models if available, or empty list
    if (models.length === 0 && defaultModel) {
      models = [defaultModel]
    }
  }

  return [models, apiKey, authUserId, modelAliases]
}
