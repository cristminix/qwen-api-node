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
  saveToJson(data: any, filename: string): void {
    // Convert data to JSON string
    const jsonString = JSON.stringify(data, null, 2);
    // Write to file using dynamic import
    import('fs').then((fsModule) => {
      fsModule.writeFileSync(filename, jsonString, 'utf8');
    }).catch((error) => {
      console.error('Error saving to JSON file:', error);
    });
  }
  init(messages: ChatMessage[]) {
    this.saveToJson(messages,`logs/messages-${Date.now()}.json`)
    let systemMessageContent = ""
    const systemMessages = messages.filter((m) => m.role === "system")
    // if(this.chatId === ""){
      // console.log("fist timer")
      let userMessageHistory = this.history.filter((m) => m.role === "user")
      let userMessages = messages.filter((m) => m.role === "user")
      if(userMessageHistory.length>0){
        userMessages = userMessages.slice(userMessageHistory.length)
      //   let index =this.history.length-1
      //   while(index <= this.messages.length){
      // //     if(this.messages[index].role === "user"){
      // //       userMessages.push(this.messages[index])
      // //     }
      // //     index +=1
      //   }
      }
      this.saveToJson(userMessageHistory,`logs/user-messages-history-${Date.now()}.json`)
      this.saveToJson(userMessages,`logs/user-messages-${Date.now()}.json`)

      for(const msg of userMessages){
        this.prompt += `${msg.content}\n`
      }
      console.log({ prompt: this.prompt })
    // }
    // else{

    // }
    
    

    if (systemMessages.length > 0) {
      const [sysMsg] = systemMessages
      systemMessageContent = sysMsg.content
      this.setInstruction(systemMessageContent)
    }
    this.updateMessageHistory()
  }
  updateMessageHistory() {
    const messageHistory = this.messages.filter((m) => m.role !== "system")

    // if (messageHistory.length > 0) {
    //   const lastIndex = messageHistory.length - 1
    //   if (messageHistory[lastIndex].role === "user") {
    //     messageHistory.pop()
    //   }
    // }
    if (messageHistory.length > 0) {
      this.history = messageHistory
    } else {
    }
    // console.log(this)
  }
}
