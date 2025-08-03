import {
  ChatCompletionRequest,
  ChatMessage,
  ImageBlock,
  TextBlock,
} from "../../../core/types/chat"
import isPromptMode from "./isPromptMode"
import { writeFileFromBase64Url } from "../../..//fn/writeFileFromBase64Url"

async function getMessages(inputMessages: ChatMessage[], providerApi: any) {
  // Gabungkan pesan sistem jika ada lebih dari satu
  const systemMessages = inputMessages.filter((msg) => msg.role === "system")
  let processedMessages = inputMessages

  if (systemMessages.length > 1) {
    const combinedSystemContent = systemMessages
      .map((msg) => (typeof msg.content === "string" ? msg.content : ""))
      .filter((content) => content.length > 0)
      .join("\n")

    // Hapus pesan sistem yang sudah digabungkan
    processedMessages = inputMessages.filter((msg) => msg.role !== "system")

    // Tambahkan pesan sistem yang sudah digabungkan
    if (combinedSystemContent.length > 0) {
      processedMessages.unshift({
        role: "system",
        content: combinedSystemContent,
      })
    }
  }

  const messages: ChatMessage[] = []
  for (const msg of processedMessages) {
    if (msg.role === "user" && Array.isArray(msg.content)) {
      const contents: ChatMessage = {
        role: "user",
        content: [],
      }
      for (const item of msg.content) {
        //@ts-ignore
        if (item.type === "image_url") {
          try {
            //@ts-ignore
            const imagePath = await writeFileFromBase64Url(item.image_url.url)
            console.log(imagePath)
            const { file_url } = await providerApi.uploadFile(imagePath)
            const image: ImageBlock = {
              block_type: "image",
              url: file_url,
            }
            //@ts-ignore
            contents.content.push(image)
          } catch (error) {
            console.error(error)
          }
        } else {
          //@ts-ignore
          if (item.type === "text") {
            const text: TextBlock = {
              block_type: "text",
              //@ts-ignore

              text: item.text,
            }
            //@ts-ignore
            contents.content.push(text)
          }
        }
      }
      messages.push(contents)
    } else {
      messages.push({
        role: msg.role,
        content: msg.content,
      })
    }
  }
  // console.log(messages)
  return messages
}
async function getChatRequestMessages(
  chatRequest: ChatCompletionRequest,
  providerApi: any
) {
  const promptMode = isPromptMode(chatRequest)
  if (promptMode) {
    return chatRequest.prompt
      ? chatRequest.prompt.map((input: string) => ({
          role: "user",
          content: input,
        }))
      : []
  }
  return Array.isArray(chatRequest.messages)
    ? await getMessages(chatRequest.messages, providerApi)
    : []
}

export default getChatRequestMessages
