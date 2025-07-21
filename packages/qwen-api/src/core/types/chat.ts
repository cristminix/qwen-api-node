import { ToolCall } from "./tools"

export type MessageRole =
  | "system"
  | "developer"
  | "user"
  | "assistant"
  | "function"
  | "tool"
  | "chatbot"
  | "model"

export interface TextBlock {
  block_type: "text"
  text: string
}

export interface ImageBlock {
  block_type: "image"
  image?: string // base64 encoded image
  path?: string
  url?: string
  image_mimetype?: string
  detail?: string
}

export interface AudioBlock {
  block_type: "audio"
  audio?: string // base64 encoded audio
  path?: string
  url?: string
  format?: string
}

export type ContentBlock = TextBlock | ImageBlock | AudioBlock

export interface ChatMessage {
  role: MessageRole
  content?: string | ContentBlock[]
  tool_calls?: ToolCall[]
  type?: string
}

export interface ChatCompletionRequest {
  messages?: ChatMessage[]
  prompt?: string[]
  model: string
  temperature?: number
  max_tokens?: number
  stream?: boolean
  tools?: any[] // Define more specific type if needed
  frequency_penalty?: any
  logprobs?: any
  n?: any
  presence_penalty?: any
  seed?: any

  top_p?: any
}

export interface Choice {
  message: ChatMessage
  // Add other fields from Python Choice class if needed
}

export interface ChatResponse {
  choices: Choice[]
  // Add other fields from Python ChatResponse class if needed
}

// Types for streaming responses
export interface Delta {
  role: MessageRole
  content: string
  tool_calls?: ToolCall[]
}

export interface ChoiceStream {
  delta: Delta
  // Add other fields if needed
}

export interface ChatResponseStream {
  choices: ChoiceStream[]
  // Add other fields like usage if needed
}
