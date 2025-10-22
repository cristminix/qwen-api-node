export const getAvailableModels = async (token) => {
  const t = "1760710721929"
  const url = `https://www.kimi.com/api/chat/models/available?t=${t}`
  const response = await fetch(url, {
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
    },
  })
  const { model_list } = await response.json()
  return model_list
}
