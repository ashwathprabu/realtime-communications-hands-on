const express = require('express')
const path = require('path')
const fs = require('fs')

const app = express()
const PORT = 3000

// Load matches data
const scoreData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'score.json'), 'utf8'))

let currentStep = 0

// Update the score every 4 seconds to simulate a live match
setInterval(() => {
    currentStep = (currentStep + 1) % scoreData.length
}, 4000)

app.use(express.static(path.join(__dirname)))

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'))
})

app.get('/api/score', (req, res) => {
    console.log(`[Short Polling] Request received at ${new Date().toLocaleTimeString()}`)
    res.json(scoreData[currentStep])
})

app.listen(PORT, () => {
    console.log(`Cricket Live Score Server running at http://localhost:${PORT}`)
})
