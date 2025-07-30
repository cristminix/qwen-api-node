import { Hono } from "hono"
import chat from "./chat"
import completions from "./completions"
import models from "./models"
const v1 = new Hono()

v1.route("/chat", chat)
v1.route("/models", models)
v1.route("/completions", completions)

export default v1
