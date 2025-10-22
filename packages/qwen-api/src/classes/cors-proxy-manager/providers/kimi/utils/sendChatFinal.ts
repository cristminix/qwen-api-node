import { ChatSession } from "src/classes/ChatSession"
import { constructPayload } from "./constructPayload"

export const sendChatFinal = async (
  token,
  messages,
  chatSession: ChatSession
) => {
  const url = `https://www.kimi.com/apiv2/kimi.gateway.chat.v1.ChatService/Chat`
  chatSession.setMessages(messages)
  let currentInputPayload = constructPayload(
    chatSession?.prompt ?? "",
    chatSession?.chatId ?? "",
    chatSession?.lastAssistantMessageId ?? "",
    chatSession?.instruction ?? ""
  )

  const response = await fetch(
    "https://www.kimi.com/apiv2/kimi.gateway.chat.v1.ChatService/Chat",
    {
      headers: {
        accept: "*/*",
        "accept-language": "en-US,en;q=0.9,id;q=0.8",
        authorization: `Bearer ${token}`,
        "cache-control": "no-cache",
        "connect-protocol-version": "1",
        "content-type": "application/connect+json",
        pragma: "no-cache",
        priority: "u=1, i",
        "r-timezone": "Asia/Jakarta",
        "sec-ch-ua":
          '"Chromium";v="140", "Not=A?Brand";v="24", "Google Chrome";v="140"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Linux"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "x-language": "en-US",
        "x-msh-device-id": "7561991421616617216",
        "x-msh-platform": "web",
      },
      // body: payloadHeader + JSON.stringify(inputPayload),
      //@ts-ignore
      body: currentInputPayload,
      method: "POST",
    }
  )

  return response
}
