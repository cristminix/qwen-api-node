import applyHonoCors from "../fn/applyHonoCors"
import createHono from "../fn/createHono"
import v1 from "../providers/qwen-api/routes/v1"

const app = createHono()

applyHonoCors(app)
app.route("/v1", v1)

app.get("/", (c) => {
  return c.html("<h1>Welcome to LLM routers</h1>")
})

export default app
