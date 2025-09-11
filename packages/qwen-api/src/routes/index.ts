import applyHonoCors from "../fn/applyHonoCors"
import createHono from "../fn/createHono"
import v1 from "./v1"
import { getUsagesByProvider } from "../db/models/usages"

const app = createHono()

applyHonoCors(app)
app.route("/v1", v1)

app.get("/", (c) => {
  return c.html("<h1>Welcome to LLM routers</h1>")
})

app.get("/usages/:provider", async (c) => {
  const provider = c.req.param("provider")
  const usageData = await getUsagesByProvider(provider)

  if (usageData === null) {
    return c.json({
      connections: 0,
      tokens: 0,
      message: "No usage data found for this provider today",
    })
  }

  return c.json(usageData)
})

export default app
