// import { io } from "socket.io-client"

import { makeStreamCompletion } from "./makeStreamCompletion"

// import fetch from "node:fetch"
const main = async () => {
  // Get prompt from CLI arguments or use default
  const prompt = process.argv[2] || "Gimme the recommended places in the world"
  // const startTime = performance.now()
  const response = await fetch(`http://127.0.0.1:4001/api/chat?prompt=${encodeURIComponent(prompt)}`)
  let data = await response.json()
  // console.log(data.phase)
  if (data.phase === "FETCH") {
    console.log("--Sending request to z.ai")
    let { url, body, headers } = data
    // console.log({ url, body, headers })
    if (body) {
      const jsonBody = JSON.parse(body)
      jsonBody.features.enable_thinking = false
      // jsonBody.features.auto_web_search = true
      jsonBody.features.web_search = true
      /**
       web_search: false,
    auto_web_search: false,
       * 
      */
      // console.log(jsonBody)
      jsonBody.messages = [{ role: "system", content: "Jawab singkat saja" }, ...jsonBody.messages]
      body = JSON.stringify(jsonBody)
    }
    const response = await fetch(`https://chat.z.ai${url}`, {
      method: "POST",
      headers: { ...headers },
      body,
    })
    await makeStreamCompletion(response, false, "glm")
    // await fetch("http://127.0.0.1:4001/api/reload-chat")
  } else {
    //   const jsonResponseStreamInput = data.body
    //   const text = parseResponseBody(jsonResponseStreamInput)
    //   console.log(text)
  }
}
main().catch((e) => {
  console.error(e)
  process.exit(1)
})
