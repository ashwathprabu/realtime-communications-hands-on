const express = require("express")

const app = express()

// SSE endpoint
app.get("/events", (req, res) => {
  // Required SSE headers
  res.setHeader("Content-Type", "text/event-stream")
  res.setHeader("Cache-Control", "no-cache")
  res.setHeader("Connection", "keep-alive")

  res.flushHeaders()

  // Send an initial message
  res.write(`data: Connected to SSE server\n\n`)

  // Send updates every 3 seconds
  const interval = setInterval(() => {
    const message = {
      time: new Date().toISOString()
    }

    res.write(`data: ${JSON.stringify(message)}\n\n`)
  }, 3000)

  // Cleanup on disconnect
  req.on("close", () => {
    clearInterval(interval)
    res.end()
    console.log("Client disconnected")
  })
})

app.listen(3000, () => {
  console.log("SSE server running on http://localhost:3000")
})
