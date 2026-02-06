const { createClient } = require("redis")

const pubClient = createClient({
  url: "redis://localhost:6379"
})

const subClient = pubClient.duplicate()

async function initRedis() {
  await pubClient.connect()
  await subClient.connect()
  console.log("Redis connected")
}

initRedis()

module.exports = { pubClient, subClient }
