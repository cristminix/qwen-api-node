export const getListChats = async (token: string) => {
  const url = `https://www.kimi.com/apiv2/kimi.chat.v1.ChatService/ListChats`
  const payload = { project_id: "", page_size: 5, query: "" }
  const response = await fetch(url, {
    method: "POST",
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
    },
    body: JSON.stringify(payload),
  })

  return await response.json()
}
