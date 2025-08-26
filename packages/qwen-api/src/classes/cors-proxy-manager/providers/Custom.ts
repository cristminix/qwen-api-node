import { Client } from "../Client"

class Custom extends Client {
  constructor(options: any = {}) {
    super({
      baseUrl: localStorage
        ? localStorage.getItem("Custom-api_base")
        : undefined,
      apiKey: localStorage ? localStorage.getItem("Custom-api_key") : undefined,
      ...options,
    })
  }
}

export { Custom }
export default Custom
