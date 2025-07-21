import ChatQwenAi from "./api/classes/ChatQwenAi"

class QwenAPI extends ChatQwenAi {
  constructor(
    authToken: string,
    cookie: string,
    baseURL: string = "https://chat.qwen.ai"
  ) {
    super(authToken, cookie, baseURL)
  }
}

export default QwenAPI
