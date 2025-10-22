// import crc32 from "crc-32"

interface ChatMessage {
  role: string
  content: string
  id?: string
  parentId?: string
  checksum?: string
  [key: string]: any
}

export class ChatSession {
  sessionId = ""
  instruction = ""
  history: ChatMessage[] = []
  messages: ChatMessage[] = []
  chatId = ""
  prompt = ""
  lastUserMessageId = ""
  lastAssistantMessageId = ""
  static instance = {}
  private constructor(sessionId) {
    this.sessionId = sessionId
  }
  static getInstance(sessionId) {
    if (!ChatSession.instance[sessionId]) {
      ChatSession.instance[sessionId] = new ChatSession(sessionId)
    }
    return ChatSession.instance[sessionId]
  }
  setMessages(inputMessages) {
    this.messages = []
    let counter = 0
    for (const message of inputMessages) {
      const messageData = {
        ...message,
        timestamp: Date.now() + counter++,
      }
      this.messages.push(messageData)
    }
    this.init(this.messages)
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
  }
  setInstruction(instruction) {
    this.instruction = instruction
  }
  setChatId(chatId) {
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

  init(messages: ChatMessage[]) {
    let systemMessageContent = ""
    const systemMessages = messages.filter((m) => m.role === "system")
    this.prompt = this.getLastUserMessage(messages).content
    // console.log({ prompt: this.prompt })

    if (systemMessages.length > 0) {
      const [sysMsg] = systemMessages
      systemMessageContent = sysMsg.content
      this.setInstruction(systemMessageContent)
    }
    this.updateMessageHistory()
  }
  updateMessageHistory() {
    const messageHistory = this.messages.filter((m) => m.role !== "system")
    if (messageHistory.length > 0) {
      const lastIndex = messageHistory.length - 1
      if (messageHistory[lastIndex].role === "user") {
        messageHistory.pop()
      }
    }
    if (messageHistory.length > 0) {
      this.history = messageHistory
    } else {
    }
    // console.log(this)
  }
}
