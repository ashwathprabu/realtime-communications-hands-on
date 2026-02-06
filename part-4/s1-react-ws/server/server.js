const express = require('express')
const http = require('http')
const { Server } = require('socket.io')
const { createAdapter } = require('@socket.io/redis-adapter')
const cors = require('cors')
const { getUpdatedStocks } = require('../script')
const { pubClient, subClient, connectRedis } = require('./redis')

const app = express()
app.use(cors())

const server = http.createServer(app)
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
})

const PORT = process.env.PORT || 3001

async function startServer() {
    // Connect to Redis and set up adapter
    await connectRedis()
    io.adapter(createAdapter(pubClient, subClient))

    io.on('connection', (socket) => {
        console.log('Client connected:', socket.id)

        // Send initial data
        socket.emit('stock-update', getUpdatedStocks())

        socket.on('disconnect', () => {
            console.log('Client disconnected:', socket.id)
        })
    })

    // Periodically update stocks and emit to all clients (via Redis adapter)
    setInterval(() => {
        const updatedStocks = getUpdatedStocks()
        io.emit('stock-update', updatedStocks)
    }, 1000)

    server.listen(PORT, () => {
        console.log(`Trading server running on http://localhost:${PORT}`)
    })
}

startServer()
