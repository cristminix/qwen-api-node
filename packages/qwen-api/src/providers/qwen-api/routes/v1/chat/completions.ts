import { Context, Hono } from "hono"
import isPromptMode from "../fn/isPromptMode"
import handleCompletions from "../fn/handleCompletions"

const completions = new Hono()

completions.post("/", async (c: Context) => {
  const chatRequest = await c.req.json()

  return await handleCompletions(chatRequest, c)
})
export default completions
