const express = require('express')
const path = require('path')

const app = express()
const PORT = 3001

let weatherData = {
    city: "San Francisco",
    temp: 62,
    condition: "Sunny",
    lastUpdated: new Date().toLocaleTimeString()
}

const clients = []

// Simulate weather changes every 10-15 seconds
setInterval(() => {
    const conditions = ["Sunny", "Cloudy", "Rainy", "Windy", "Foggy"]
    weatherData = {
        city: "San Francisco",
        temp: Math.floor(Math.random() * (75 - 55 + 1)) + 55,
        condition: conditions[Math.floor(Math.random() * conditions.length)],
        lastUpdated: new Date().toLocaleTimeString()
    }

    console.log(`[Long Polling] Update occurred: ${weatherData.condition}, ${weatherData.temp}°F`)

    // Notify all pending clients
    while (clients.length > 0) {
        const res = clients.shift()
        res.json(weatherData)
    }
}, 12000)

app.use(express.static(path.join(__dirname)))

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'))
})

app.get('/api/weather', (req, res) => {
    console.log(`[Long Polling] Client connected at ${new Date().toLocaleTimeString()}. Request held...`)
    clients.push(res)

    // Timeout the request after 30 seconds to prevent hanging indefinitely
    // and let the client re-establish the connection.
    setTimeout(() => {
        const index = clients.indexOf(res)
        if (index !== -1) {
            console.log(`[Long Polling] Request timeout for client at ${new Date().toLocaleTimeString()}.`)
            clients.splice(index, 1)
            res.status(204).end() // No Content, client should retry
        }
    }, 30000)
})

app.listen(PORT, () => {
    console.log(`Weather App (Long Polling) Server running at http://localhost:${PORT}`)
})
