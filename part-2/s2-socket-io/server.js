const express = require("express")
const http = require("http")
const { Server } = require("socket.io")

const app = express()
const server = http.createServer(app)
const io = new Server(server)

// Handle socket connections
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id)

  // Listen for messages from client
  socket.on("message", (data) => {
    console.log("Received:", data)

    // Send back to the same client
    socket.emit("message", `Server received: ${data}`)
  })

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id)
  })
})

server.listen(3000, () => {
  console.log("Socket.IO server running on http://localhost:3000")
})
