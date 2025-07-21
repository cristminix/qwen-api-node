import { ChatMessage } from "../../../../core/types/chat"

export interface UploadResult {
  file_url: string
  file_id: string
}

export interface InternalPayloadMessage {
  role: ChatMessage["role"]
  content: string
  chat_type: string
  feature_config: {
    thinking_enabled: boolean
    thinking_budget: number
    output_schema: null
  }
  extra: {}
}
