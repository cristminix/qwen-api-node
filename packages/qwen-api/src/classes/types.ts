export interface MessageTask {
  status: string | boolean
}

export interface ChatMessageInterface {
  role: string
  content: string
  id: string
  username: string
  parentId: string
  groupId: string
  folderId?: string
  collapsed?: boolean | number
  replyCount?: number
}

export interface ConversationInterface {
  id: string
  title: string
  createdAt: string
  updatedAt: string
  systemMessage: string
  enableSystemMessage: boolean | number
}
export interface ReasoningResponse {
  token?: string
  status?: string
  label?: string
}
