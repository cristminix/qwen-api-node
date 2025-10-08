import { choice as randomChoice } from "src/classes/Random"

export function getModel(
  modelName: string | null,
  modelAliases: Record<string, string | string[]>,
  defaultModel: string,
  availableModels: string[] = [],
  lastModel?: string
): string {
  // If no model is provided and a default model is set, use the default
  if (!modelName && defaultModel) {
    modelName = defaultModel
  }
  // console.log({ modelAliases })
  // If the model is in the aliases, resolve it
  if (modelName && modelAliases[modelName]) {
    const alias = modelAliases[modelName]

    // If the alias is an array, randomly select one model
    if (Array.isArray(alias)) {
      const selectedModel = randomChoice(alias)
      console.log(
        `ZAI: Selected model '${selectedModel}' from alias '${modelName}'`
      )
      return selectedModel
    }

    // If the alias is a string, use that model
    console.log(`ZAI: Using model '${alias}' for alias '${modelName}'`)
    return alias
  }

  // Check if the model exists in available models or aliases
  if (modelName) {
    // Check if model is in aliases values
    const isInAliasesValues = Object.values(modelAliases).some((value) =>
      Array.isArray(value) ? value.includes(modelName) : value === modelName
    )

    // If not in aliases values and not in available models, throw an error
    if (
      !isInAliasesValues &&
      availableModels.length > 0 &&
      !availableModels.includes(modelName)
    ) {
      throw new Error(
        `Model not found: ${modelName} in ZAI. Valid models: ${availableModels.join(", ")}`
      )
    }
  }

  // Return the model (or default if model is null)
  return modelName || defaultModel
}
