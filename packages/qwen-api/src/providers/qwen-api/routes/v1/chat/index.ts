import { Hono } from "hono"
import completions from "./completions"

const chat = new Hono()
chat.route("/completions", completions)
export default chat
