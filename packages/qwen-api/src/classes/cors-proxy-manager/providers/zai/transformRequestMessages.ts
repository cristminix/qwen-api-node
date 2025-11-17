interface MessageContent {
  type: string
  text?: string
}

interface Message {
  role: string
  content: string | MessageContent[]
}

export interface TransformedMessage {
  role: string
  content: string
}

/**
 * Transformasi struktur messages untuk menangani konten kompleks
 *
 * @param messages - Daftar pesan yang akan ditransformasi
 * @returns Pesan yang telah ditransformasi
 */
export function transformMessages(messages: Message[]): TransformedMessage[] {
  const transformedMessages: TransformedMessage[] = []

  for (const message of messages) {
    if (Array.isArray(message.content)) {
      // Buat objek terpisah untuk setiap konten teks
      for (const item of message.content) {
        if (item.type === "text" && item.text) {
          transformedMessages.push({
            role: message.role,
            content: item.text,
          })
        }
      }
    } else if (typeof message.content === "string") {
      // Jika sudah string, langsung tambahkan
      transformedMessages.push({
        role: message.role,
        content: message.content,
      })
    }
  }

  // Variabel untuk menampung pesan system yang digabungkan
  const systemMessages = transformedMessages.filter((msg) => msg.role === "system")
  let finalSystemMessages: TransformedMessage[] = []
  const combineSystemMessages = false

  if (systemMessages.length > 1 && combineSystemMessages) {
    // iterate system_messages and append content
    const combinedSystemMessageContents = systemMessages.map((message) => message.content)
    finalSystemMessages = [
      {
        role: "user",
        content: combinedSystemMessageContents.join("\n\n"),
      },
    ]
  } else {
    finalSystemMessages = systemMessages.map((m) => ({
      role: "user",
      content: m.content,
    }))
  }
  // console.log({finalSystemMessages})
  const userMessages = transformedMessages.filter((msg) => msg.role === "user")
  const finalMessages = finalSystemMessages.concat(userMessages)

  // debug.log(JSON.stringify(finalMessages, null, 2));
  return finalMessages
}
