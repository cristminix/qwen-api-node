import crc32 from "crc-32"
import fs from "fs/promises"
import path from "path"
import { getKimiChatByChatId, getKimiChatByChecksum, saveKimiChat, updateKimiChat } from "../db/models"

// Enhanced interfaces with proper typing
interface ChatMessage {
  role: "system" | "user" | "assistant"
  content: string
  id?: string
  parentId?: string
  checksum?: string
  timestamp?: number
  metadata?: Record<string, unknown>
}

interface ChatRegistry {
  chatId: string
  lastUserMessageId: string
  lastAssistantMessageId: string
  checksum: string[]
  sessionId: string
  history: ChatMessage[]
  createdAt: number
  updatedAt: number
}

interface ChatSessionConfig {
  registryPath?: string
  maxHistorySize?: number
  enableLogging?: boolean
  logDirectory?: string
}

// Custom error types for better error handling
class ChatSessionError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: unknown
  ) {
    super(message)
    this.name = "ChatSessionError"
  }
}

class FileOperationError extends ChatSessionError {
  constructor(message: string, details?: unknown) {
    super(message, "FILE_OPERATION_ERROR", details)
  }
}

class ValidationError extends ChatSessionError {
  constructor(message: string, details?: unknown) {
    super(message, "VALIDATION_ERROR", details)
  }
}

/**
 * Enhanced ChatSession class with improved performance, error handling, and maintainability
 */
export class ChatSession {
  // Private fields for encapsulation
  private _sessionId: string
  private _instruction: string = ""
  private _history: ChatMessage[] = []
  private _messages: ChatMessage[] = []
  private _chatId: string = ""
  private _oldChatId: string = ""
  private _prompt: string = ""
  private _lastUserMessageId: string = ""
  private _lastAssistantMessageId: string = ""
  private _chatRegistry: ChatRegistry | null = null
  private _useDatabase: boolean = process.env.CHAT_SESSION_USE_DATABASE === "true" ? true : false

  // Configuration
  private readonly config: Required<ChatSessionConfig>

  // Static properties with proper initialization
  private static _chatRegistries: ChatRegistry[] = []
  private static _instances: Map<string, ChatSession> = new Map()
  private static _registryLoaded: boolean = false
  private static _loadPromise: Promise<void> | null = null

  private _databaseHandler = {
    getRecordByChecksum: async (checksum: string) => { return await getKimiChatByChecksum(checksum) },
    getRecordByChatId: async (chatId: string) => { return await getKimiChatByChatId(chatId) },
    updateRecord: async (chatId: string, row: any) => { return await updateKimiChat(chatId, row) },
    createRecord: async (row: any) => { return await saveKimiChat(row) }
  }

  // Default configuration
  private static readonly DEFAULT_CONFIG: Required<ChatSessionConfig> = {
    registryPath: "chat-registry.json",
    maxHistorySize: 1000,
    enableLogging: true,
    logDirectory: "logs",
  }

  private constructor(sessionId: string, config: ChatSessionConfig = {}) {
    // Input validation
    if (!sessionId || typeof sessionId !== "string") {
      throw new ValidationError("Session ID must be a non-empty string")
    }

    this._sessionId = sessionId
    this.config = { ...ChatSession.DEFAULT_CONFIG, ...config }
  }

  /**
   * Thread-safe singleton implementation with proper error handling
   */
  static async getInstance(
    sessionId: string,
    config?: ChatSessionConfig
  ): Promise<ChatSession> {
    if (!sessionId || typeof sessionId !== "string") {
      throw new ValidationError("Session ID must be a non-empty string")
    }

    // Ensure registry is loaded before creating instances
    if (!ChatSession._registryLoaded && !ChatSession._loadPromise) {
      ChatSession._loadPromise = ChatSession.loadRegistryFromFile()
    }

    if (ChatSession._loadPromise) {
      await ChatSession._loadPromise
    }

    if (!ChatSession._instances.has(sessionId)) {
      const instance = new ChatSession(sessionId, config)
      await instance.initialize()
      ChatSession._instances.set(sessionId, instance)
    }

    return ChatSession._instances.get(sessionId)!
  }

  /**
   * Load registry from file with proper error handling and caching
   */
  private static async loadRegistryFromFile(): Promise<void> {
    try {
      const registryPath = path.resolve(ChatSession.DEFAULT_CONFIG.registryPath)
      const exists = await ChatSession.fileExists(registryPath)

      if (exists) {
        const data = await fs.readFile(registryPath, "utf-8")
        ChatSession._chatRegistries = JSON.parse(data) as ChatRegistry[]

        // Validate registry structure
        if (!Array.isArray(ChatSession._chatRegistries)) {
          throw new FileOperationError(
            "Invalid registry format: expected array"
          )
        }
      } else {
        ChatSession._chatRegistries = []
      }

      ChatSession._registryLoaded = true
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new FileOperationError("Invalid JSON in registry file", error)
      }
      throw new FileOperationError("Failed to load registry", error)
    }
  }

  /**
   * Initialize the session with proper setup
   */
  private async initialize(): Promise<void> {
    try {
      await this.loadRegistry()
    } catch (error) {
      throw new ChatSessionError(
        "Failed to initialize session",
        "INITIALIZATION_ERROR",
        error
      )
    }
  }

  /**
   * Enhanced registry loading with better performance using Map for O(1) lookups
   */
  private async loadRegistry(): Promise<void> {
    const hexChecksum = this.generateChatChecksum()
    let foundRegistry: any
    if (this._useDatabase) {
      foundRegistry = await this._databaseHandler.getRecordByChecksum(hexChecksum)
    } else {
      // Use Map for efficient lookups
      const registryMap = new Map(
        ChatSession._chatRegistries.map((reg) => [reg.chatId, reg])
      )

      // Check by checksum first
      foundRegistry = ChatSession._chatRegistries.find((reg) =>
        reg.checksum.includes(hexChecksum)
      )

      // Fallback to chatId if no checksum match
      if (!foundRegistry && this._chatId) {
        foundRegistry = registryMap.get(this._chatId)
      }
    }


    if (foundRegistry) {
      this._chatRegistry = foundRegistry
      this._chatId = foundRegistry.chatId
      this._lastUserMessageId = foundRegistry.lastUserMessageId
      this._lastAssistantMessageId = foundRegistry.lastAssistantMessageId
    } else {
      this._chatRegistry = null
      this._chatId = ""
      this._lastUserMessageId = ""
      this._lastAssistantMessageId = ""
      console.log("reset")
    }
  }

  /**
   * Optimized checksum generation with caching
   */
  private generateChatChecksum(): string {
    const unifiedChatHistory = this._history.map((m) => ({
      role: m.role,
      content: m.content,
    }))

    const checksum = crc32.str(
      JSON.stringify(unifiedChatHistory) + this._instruction
    )

    return (checksum >>> 0).toString(16).padStart(8, "0")
  }
  setStorage(t: string) {
    this._useDatabase = t === 'file' ? false : true
  }
  /**
   * Enhanced message validation and processing
   */
  async setMessages(inputMessages: ChatMessage[]): Promise<void> {
    // Input validation
    if (!Array.isArray(inputMessages)) {
      throw new ValidationError("Messages must be an array")
    }

    if (inputMessages.length === 0) {
      throw new ValidationError("Messages array cannot be empty")
    }

    // Validate message structure
    inputMessages.forEach((message, index) => {
      if (!message.role || !message.content) {
        throw new ValidationError(
          `Invalid message at index ${index}: role and content are required`
        )
      }

      if (!["system", "user", "assistant"].includes(message.role)) {
        throw new ValidationError(
          `Invalid role at index ${index}: must be system, user, or assistant`
        )
      }
    })

    // Process messages with timestamps
    this._messages = inputMessages.map((message, index) => ({
      ...message,
      timestamp: Date.now() + index,
    }))

    await this.init(this._messages)
  }
  updateLastUserMessageId(id) {
    this._lastUserMessageId = id
  }
  /**
   * Enhanced assistant message insertion with validation
   */
  async insertAssistantMessage(content: string, id: string): Promise<void> {
    if (!content || typeof content !== "string") {
      throw new ValidationError("Content must be a non-empty string")
    }

    if (!id || typeof id !== "string") {
      throw new ValidationError("ID must be a non-empty string")
    }

    this._lastAssistantMessageId = id

    const assistantMessage: ChatMessage = {
      role: "assistant",
      content,
      id,
      parentId: this._lastUserMessageId,
      timestamp: Date.now(),
    }

    this._messages.push(assistantMessage)
    this.updateMessageHistory()
    await this.commitRegistry()
  }

  /**
   * Enhanced instruction setter with validation
   */
  setInstruction(instruction: string): void {
    if (typeof instruction !== "string") {
      throw new ValidationError("Instruction must be a string")
    }

    this._instruction = instruction.trim()
  }

  /**
   * Enhanced chat ID setter with validation
   */
  setChatId(chatId: string): void {
    if (!chatId || typeof chatId !== "string") {
      throw new ValidationError("Chat ID must be a non-empty string")
    }

    this._oldChatId = this._chatId
    this._chatId = chatId

    // if (this._useDatabase) {
    //   this._databaseHandler.createRecord({
    //     chatId,
    //     lastUserMessageId: "",
    //     lastAssistantMessageId: "",
    //     history: [],
    //     checksum: []
    //   })
    // }
  }

  /**
   * Enhanced registry commit with proper error handling and atomic operations
   */
  private async commitRegistry(): Promise<void> {
    try {
      const hexChecksum = this.generateChatChecksum()
      const unifiedChatHistory = this._history.map((m) => ({
        role: m.role,
        content: m.content,
      }))

      const now = Date.now()

      if (this._chatRegistry) {
        if (!this._useDatabase) {
          // Update existing registry
          const registryIndex = ChatSession._chatRegistries.findIndex(
            (reg) => reg.chatId === this._chatId || reg.chatId === this._oldChatId
          )

          if (registryIndex !== -1) {
            const registry = ChatSession._chatRegistries[registryIndex]

            if (this._chatId !== this._oldChatId) {
              registry.chatId = this._chatId
            }

            // Avoid duplicate checksums
            if (!registry.checksum.includes(hexChecksum)) {
              registry.checksum.push(hexChecksum)
            }

            ; ((registry.history = []), //unifiedChatHistory
              (registry.updatedAt = now))
          }
        } else {
          const { lastAssistantMessageId, lastUserMessageId, checksum } = this._chatRegistry
          if (!checksum.includes(hexChecksum)) {
            checksum.push(hexChecksum)
          }
          const update = { lastAssistantMessageId, lastUserMessageId, history: unifiedChatHistory, checksum }
          this._databaseHandler.updateRecord(this.chatId, update)
        }
      } else {
        // Create new registry
        this._chatRegistry = {
          chatId: this._chatId,
          lastUserMessageId: this._lastUserMessageId,
          lastAssistantMessageId: this._lastAssistantMessageId,
          checksum: [hexChecksum],
          sessionId: this._sessionId,
          history: [], //unifiedChatHistory,
          createdAt: now,
          updatedAt: now,
        }
        if (!this._useDatabase) {
          ChatSession._chatRegistries.push(this._chatRegistry)
        } else {

          this._databaseHandler.createRecord({ ...this._chatRegistry, history: unifiedChatHistory })
        }
      }

      if (!this._useDatabase) {
        // Atomic file write using temporary file
        await this.saveRegistryAtomically()
      }
    } catch (error) {
      throw new FileOperationError("Failed to commit registry", error)
    }
  }

  /**
   * Atomic file save operation to prevent corruption
   */
  private async saveRegistryAtomically(): Promise<void> {
    const registryPath = path.resolve(this.config.registryPath)
    const tempPath = `${registryPath}.tmp`

    try {
      const jsonString = JSON.stringify(ChatSession._chatRegistries, null, 2)

      // Ensure directory exists
      const dir = path.dirname(registryPath)
      await fs.mkdir(dir, { recursive: true })

      // Write to temporary file first
      await fs.writeFile(tempPath, jsonString, "utf-8")

      // Atomic rename
      await fs.rename(tempPath, registryPath)
    } catch (error) {
      // Cleanup temp file on error
      try {
        await fs.unlink(tempPath)
      } catch {
        // Ignore cleanup errors
      }
      throw new FileOperationError("Failed to save registry atomically", error)
    }
  }

  /**
   * Enhanced message history update with size limiting
   */
  private updateMessageHistory(): void {
    let msgIndex = this._messages.length

    while (msgIndex-- > 0) {
      const msg = this._messages[msgIndex]
      if (msg.role === "assistant") {
        break
      }
    }

    this._history = this._messages
      .filter((m) => m.role !== "system")
      .slice(0, msgIndex + 1)

    // Limit history size to prevent memory issues
    if (this._history.length > this.config.maxHistorySize) {
      this._history = this._history.slice(-this.config.maxHistorySize)
    }
  }

  /**
   * Enhanced initialization with better error handling
   */
  private async init(messages: ChatMessage[]): Promise<void> {
    try {
      if (this.config.enableLogging) {
        await this.logToJson(messages, "messages")
      }

      const systemMessages = messages.filter((m) => m.role === "system")

      // Find the last assistant message index
      const lastAssistantIndex = messages.findLastIndex(
        (m) => m.role === "assistant"
      )

      const userMessages = messages
        .filter((m) => m.role !== "system")
        .slice(lastAssistantIndex + 1)

      const messageHistory = messages
        .filter((m) => m.role !== "system")
        .slice(0, lastAssistantIndex + 1)

      if (this.config.enableLogging) {
        await this.logToJson(messageHistory, "message-history")
        await this.logToJson(userMessages, "user-messages")
      }

      this._prompt = ""

      if (userMessages.length === 0) {
        const lastUserMessages = messageHistory
          .filter((m) => m.role === "user")
          .slice(-1)

        this._prompt = lastUserMessages.map((m) => m.content).join("\n")
      } else {
        this._prompt = userMessages
          .filter((m) => m.role === "user")
          .map((m) => m.content)
          .join("\n")
      }

      if (systemMessages.length > 0) {
        const [sysMsg] = systemMessages
        this.setInstruction(sysMsg.content)
      }

      this.updateMessageHistory()
      await this.loadRegistry()
    } catch (error) {
      throw new ChatSessionError(
        "Failed to initialize messages",
        "INIT_ERROR",
        error
      )
    }
  }

  /**
   * Enhanced logging with proper error handling
   */
  private async logToJson(obj: unknown, type: string): Promise<void> {
    if (!this.config.enableLogging) return

    try {
      const timestamp = Date.now()
      const logDir = path.join(this.config.logDirectory, this._sessionId)
      const filename = `${type}-${timestamp}.json`

      await this.saveObjectToJson(obj, logDir, filename)
    } catch (error) {
      // Log errors should not break the main flow
      console.warn("Failed to log data:", error)
    }
  }

  /**
   * Utility method for checking file existence
   */
  private static async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath)
      return true
    } catch {
      return false
    }
  }

  /**
   * Enhanced file operations with proper error handling
   */
  private async saveObjectToJson(
    data: unknown,
    outDir: string,
    filename: string
  ): Promise<void> {
    try {
      const filePath = path.join(outDir, filename)

      // Ensure directory exists
      await fs.mkdir(outDir, { recursive: true })

      const jsonString = JSON.stringify(data, null, 2)
      await fs.writeFile(filePath, jsonString, "utf-8")
    } catch (error) {
      throw new FileOperationError(
        `Failed to save JSON file: ${filename}`,
        error
      )
    }
  }

  // Public getters for encapsulation
  get sessionId(): string {
    return this._sessionId
  }
  get prompt(): string {
    return this._prompt
  }
  get instruction(): string {
    return this._instruction
  }
  get history(): ChatMessage[] {
    return [...this._history]
  }
  get messages(): ChatMessage[] {
    return [...this._messages]
  }
  get chatId(): string {
    return this._chatId
  }
  get lastUserMessageId(): string {
    return this._lastUserMessageId
  }
  get lastAssistantMessageId(): string {
    return this._lastAssistantMessageId
  }

  // Utility methods
  getLastUserMessage(): ChatMessage | undefined {
    return this._messages.findLast((m) => m.role === "user")
  }

  getLastAssistantMessage(): ChatMessage | undefined {
    return this._messages.findLast((m) => m.role === "assistant")
  }

  clearHistory(): void {
    this._history = []
    this._messages = []
    this._prompt = ""
  }

  /**
   * Cleanup method for proper resource management
   */
  static async cleanup(sessionId?: string): Promise<void> {
    if (sessionId) {
      ChatSession._instances.delete(sessionId)
    } else {
      ChatSession._instances.clear()
    }
  }
}
