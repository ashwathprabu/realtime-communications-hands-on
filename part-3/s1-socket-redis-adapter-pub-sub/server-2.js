const { createServer } = require("http")
const { Server } = require("socket.io")
const { createAdapter } = require("@socket.io/redis-adapter")
const { pubClient, subClient } = require("./redis")

const SERVER_NAME = "Server B"
const PORT = 3001

const httpServer = createServer()

const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
})

io.adapter(createAdapter(pubClient, subClient))

io.of("/").adapter.on("broadcast", (packet) => {
  console.log(`${SERVER_NAME} received FROM REDIS:`, packet.data)
})

io.on("connection", (socket) => {
  console.log(`${SERVER_NAME}: client connected`, socket.id)

  socket.on("join-room", (data) => {
    console.log(JSON.stringify(data))
    socket.join(data.room)
    socket.data.room = data.room
    socket.data.username = data.username
    
    console.log(`${SERVER_NAME}: ${data.username} joined room ${data.room}`)
    
    // Notify room that user joined
    io.to(data.room).emit("system", `${data.username} joined the chat Server 2`)
  })

 socket.on("chat", (msg) => {
    console.log('message', JSON.stringify(msg))
    console.log('socket', JSON.stringify(socket.data))
   
    const room = socket.data.room
    const username = socket.data.username

    console.log(`${SERVER_NAME} got FROM CLIENT (${username}):`, msg)

    // Send to EVERYONE in the room including sender
    io.to(room).emit("chat", {
      user: username,
      msg: msg,
      server: SERVER_NAME
    })
  })

  socket.on("disconnect", () => {
    const username = socket.data.username
    const room = socket.data.room
    
    console.log(`${SERVER_NAME}: client disconnected`, socket.id)
    
    if (room && username) {
      io.to(room).emit("system", `${username} left the chat Server 2`)
    }
  })
})

httpServer.listen(PORT, () => {
  console.log(`${SERVER_NAME} listening on port ${PORT}`)
})