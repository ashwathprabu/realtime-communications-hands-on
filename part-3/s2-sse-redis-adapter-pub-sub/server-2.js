const express = require("express")
const cors = require("cors")
const Redis = require("ioredis")

const app = express()
app.use(cors({
  exposedHeaders: ["X-Server"]
}))
app.use(express.json())

const pub = new Redis()
const sub = new Redis()

const SERVER_NAME = "Server-B"
const PORT = 3001

// symbol -> Set<{ res, userId }>
const connections = new Map()

/**
 * SSE: Subscribe to stock updates
 * GET /sse/stock?symbol=AAPL&userId=alice
 */
app.get("/sse/stock", (req, res) => {
  const { symbol, userId } = req.query
  if (!symbol || !userId) {
    return res.status(400).end("symbol and userId required")
  }

  res.set({
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    "Connection": "keep-alive",
    "X-Server": SERVER_NAME,
  })
  res.flushHeaders()

  const conn = { res, userId }

  if (!connections.has(symbol)) {
    connections.set(symbol, new Set())
    sub.subscribe(`stock:${symbol}`)
    console.log(`${SERVER_NAME}: subscribed stock:${symbol}`)
  }

  connections.get(symbol).add(conn)

  console.log(`${SERVER_NAME}: ${userId} watching ${symbol}`)

  res.write(`event: system\ndata: connected to ${SERVER_NAME}\n\n`)

  req.on("close", () => {
    const set = connections.get(symbol)
    if (!set) return

    set.delete(conn)

    if (set.size === 0) {
      connections.delete(symbol)
      sub.unsubscribe(`stock:${symbol}`)
      console.log(`${SERVER_NAME}: unsubscribed stock:${symbol}`)
    }
  })
})

/**
 * BUY STOCK
 * POST /stock/buy
 */
app.post("/stock/buy", async (req, res) => {
  const { symbol, userId, qty } = req.body
  if (!symbol || !userId || !qty) {
    return res.status(400).json({ error: "missing fields" })
  }

  // fake price (demo only)
  const price = (Math.random() * 100 + 100).toFixed(2)

  const event = JSON.stringify({
    type: "BUY",
    user: userId,
    symbol,
    qty,
    price,
    server: SERVER_NAME,
    ts: Date.now()
  })

  await pub.publish(`stock:${symbol}`, event)

  console.log(`${SERVER_NAME}: BUY ${symbol} x${qty}`)

  res.setHeader("X-Server", SERVER_NAME)
  res.json({ ok: true, symbol, qty, price, server: SERVER_NAME })
})

/**
 * REDIS → SSE
 */
sub.on("message", (channel, message) => {
  const symbol = channel.split(":")[1]
  const conns = connections.get(symbol)
  if (!conns) return

  for (const { res } of conns) {
    res.write(`event: update\ndata: ${message}\n\n`)
  }

  console.log(`${SERVER_NAME}: pushed update for ${symbol}`)
})

app.listen(PORT, () => {
  console.log(`${SERVER_NAME} listening on ${PORT}`)
})
