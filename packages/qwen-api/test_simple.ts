import Pollinations from "./src/providers/pollinations/Pollinations"

async function test() {
  console.log("Creating Pollinations instance...")
  const pollinations = new Pollinations()
  console.log("Pollinations instance created successfully")
}

test()
