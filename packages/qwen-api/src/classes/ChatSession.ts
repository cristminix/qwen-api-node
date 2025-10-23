import crc32 from "crc-32"
import fs from "fs"
interface ChatMessage {
  role: string
  content: string
  id?: string
  parentId?: string
  checksum?: string
  [key: string]: any
}

interface ChatRegistry {
  chatId: string
  lastUserMessageId: string
  lastAssistantMessageId: string
  checksum: string[]
  sessionId: string
  history: ChatMessage[]
}
export class ChatSession {
  sessionId = ""
  instruction = ""
  history: ChatMessage[] = []
  messages: ChatMessage[] = []
  chatId = ""
  oldChatId = ""
  prompt = ""
  lastUserMessageId = ""
  lastAssistantMessageId = ""
  static chatRegistries: ChatRegistry[] = []
  chatRegistry: ChatRegistry | null = null
  static chatRegistryJsonPath = "chat-registry.json"

  static instance = {}
  private constructor(sessionId) {
    this.sessionId = sessionId
  }
  private async loadRegistry() {
    try {
      ChatSession.chatRegistries = await ChatSession.loadObjectFromJson('.', ChatSession.chatRegistryJsonPath)
    } catch (error) {
      ChatSession.chatRegistries = []
    }
    const hexChecksum = this.generateChatChecksum()
    console.log("Load registry", { hexChecksum })
    const existingRegistryIndex = ChatSession.chatRegistries.findIndex(reg => reg.checksum.includes(hexChecksum))
    if (existingRegistryIndex !== -1) {
      this.chatRegistry = ChatSession.chatRegistries[existingRegistryIndex]
      this.chatId = this.chatRegistry.chatId
      this.lastUserMessageId = this.chatRegistry.lastUserMessageId
      this.lastAssistantMessageId = this.chatRegistry.lastAssistantMessageId
      console.log("Load registry checksum found", this.chatRegistry)

    } else {
      console.log("Load registry checksum not found")

    }

  }
  private generateChatChecksum() {
    const unifiedChatHistory = this.history.map(m => ({ role: m.role, content: m.content }))
    console.log("unifiedChatHistory", JSON.stringify(unifiedChatHistory, null, 2))
    const checksum = crc32.str(JSON.stringify(unifiedChatHistory) + this.instruction)
    const hexChecksum = (checksum >>> 0).toString(16).padStart(8, '0')
    // console.log({ checksum, hexChecksum })
    return hexChecksum
  }
  private async commitRegistry() {
    const hexChecksum = this.generateChatChecksum()
    const unifiedChatHistory = this.history.map(m => ({ role: m.role, content: m.content }))
    console.log("commitRegistry", { hexChecksum })
    // Update the registry with the hex checksum
    let existingRegistryIndex = ChatSession.chatRegistries.findIndex(reg => reg.chatId === this.chatId || reg.chatId === this.oldChatId)
    if (this.chatRegistry) {
      console.log("existing chatIds", ChatSession.chatRegistries.map(r => (r.chatId)))
      console.log("Updating existing chatRegistry", this.chatId, this.oldChatId)
    }

    console.log("commitRegistry", { existingRegistryIndex })
    if (existingRegistryIndex > -1) {
      if (this.chatId !== this.oldChatId) {
        ChatSession.chatRegistries[existingRegistryIndex].chatId = this.chatId

      }
      ChatSession.chatRegistries[existingRegistryIndex].checksum.push(hexChecksum)
      ChatSession.chatRegistries[existingRegistryIndex].history = unifiedChatHistory
    } else {
      this.chatRegistry = {
        chatId: this.chatId,
        lastUserMessageId: this.lastUserMessageId,
        lastAssistantMessageId: this.lastAssistantMessageId,
        checksum: [hexChecksum],
        sessionId: this.sessionId,
        history: unifiedChatHistory
      }
      ChatSession.chatRegistries.push(this.chatRegistry)
    }
    console.log(this.chatRegistry)
    console.log(ChatSession.chatRegistries)
    // }
    await ChatSession.saveObjectToJson(ChatSession.chatRegistries, '.', ChatSession.chatRegistryJsonPath)
  }
  static getInstance(sessionId) {
    if (!ChatSession.instance[sessionId]) {
      ChatSession.instance[sessionId] = new ChatSession(sessionId)
    }
    return ChatSession.instance[sessionId]
  }
  async setMessages(inputMessages) {
    this.messages = []
    // let counter = 0
    for (const message of inputMessages) {
      const messageData = {
        ...message,
        // timestamp: Date.now() + counter++,
      }
      this.messages.push(messageData)
    }
    await this.init(this.messages)
  }

  updateLastUserMessage(id, parentId) {
    // set last user message id and parentId
    const userMessage = this.getLastUserMessage(this.messages)
    userMessage.id = id
    if (parentId) userMessage.parentId = parentId
    this.lastUserMessageId = id
  }
  insertAssistantMessage(content, id) {
    // set last user message id and parentId
    this.lastAssistantMessageId = id
    const assistantMessage = {
      role: "assistant",
      content,
      id,
      parentId: this.lastUserMessageId,
    }
    this.messages.push(assistantMessage)
    this.updateMessageHistory()
    this.commitRegistry()

  }
  setInstruction(instruction) {
    this.instruction = instruction
  }
  setChatId(chatId) {
    this.oldChatId = this.chatId
    this.chatId = chatId
  }
  setLastId(userId, assistantId) {
    this.lastUserMessageId = userId
    this.lastAssistantMessageId = assistantId
  }
  getMessages() {
    return this.messages
  }
  getLastUserMessage(messages) {
    return messages.findLast((m) => m.role === "user")
  }
  static async logToJson(obj: any, sessionId: string, t = "messages") {
    await ChatSession.saveObjectToJson(obj, `logs/${sessionId}`, `${t}-${Date.now()}.json`)
  }
  static async saveObjectToJson(data: any, outDir: string, filename: string) {
    // Convert data to JSON string
    const path = `${outDir}/${filename}`
    if (!(await fs.existsSync(outDir))) {
      await fs.mkdirSync(outDir, { recursive: true })
    }

    const jsonString = JSON.stringify(data, null, 2);
    // Write to file using dynamic import
    await fs.writeFileSync(path, jsonString, 'utf8');
  }

  static async loadObjectFromJson(outDir: string, filename: string) {
    const path = `${outDir}/${filename}`;
    if (!(await fs.existsSync(path))) {
      throw new Error(`File does not exist: ${path}`);
    }

    const jsonString = await fs.readFileSync(path, 'utf8');
    return JSON.parse(jsonString);
  }
  async init(messages: ChatMessage[]) {
    await ChatSession.logToJson(messages, this.sessionId, 'messages')
    let systemMessageContent = ""
    const systemMessages = messages.filter((m) => m.role === "system")
    // construct chatHistory 

    let msgIndex = messages.length
    while (msgIndex-- > 0) {
      const msg = messages[msgIndex]
      if (msg.role === "assistant") {
        break
      }
    }
    // let userMessageHistory = this.history.filter((m) => m.role === "user")
    let userMessages = messages.filter((m) => m.role !== "system").slice(msgIndex + 1, messages.length)
    // if (userMessageHistory.length > 0) {
    // userMessages = userMessages.slice(msgIndex)
    // }
    const messageHistory = messages.filter((m) => m.role !== "system").slice(0, msgIndex + 1)
    await ChatSession.logToJson(messageHistory, this.sessionId, 'message-history')
    await ChatSession.logToJson(userMessages, this.sessionId, 'user-messages')
    this.prompt = ""
    for (const msg of userMessages) {
      if (msg.role === "user")
        this.prompt += `${msg.content}\n`
    }
    // console.log({ prompt: this.prompt })
    if (systemMessages.length > 0) {
      const [sysMsg] = systemMessages
      systemMessageContent = sysMsg.content
      this.setInstruction(systemMessageContent)
    }
    this.updateMessageHistory()
    await this.loadRegistry()
  }
  updateMessageHistory() {
    let msgIndex = this.messages.length
    while (msgIndex-- > 0) {
      const msg = this.messages[msgIndex]
      if (msg.role === "assistant") {
        break
      }
    }
    this.history = this.messages.filter((m) => m.role !== "system").slice(0, msgIndex + 1)

  }
}
