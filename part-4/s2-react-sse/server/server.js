const express = require('express')
const cors = require('cors')
const { getLoremIpsumTokens } = require('./lib/script')

const app = express()
app.use(cors())

const PORT = process.env.PORT || 3001

app.get('/chat', (req, res) => {
    const prompt = req.query.prompt || '';

    // Set headers for SSE
    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')
    res.flushHeaders()

    console.log(`Chat request started for prompt: "${prompt}"`)

    const tokens = getLoremIpsumTokens()
    let index = 0;

    const interval = setInterval(() => {
        if (index < tokens.length) {
            const token = tokens[index]
            res.write(`data: ${JSON.stringify({ token: token + (index === tokens.length - 1 ? "" : " ") })}\n\n`)
            index++
        } else {
            res.write(`data: [DONE]\n\n`)
            clearInterval(interval)
            res.end()
        }
    }, Math.floor(Math.random() * (150 - 50 + 1) + 50)) // Random delay between 50-150ms

    // Handle client disconnection (Stop button or close tab)
    req.on('close', () => {
        console.log(`Chat stream closed by client`)
        clearInterval(interval)
    })
})

app.listen(PORT, () => {
    console.log(`SSE AI Chat server running on http://localhost:${PORT}`)
})
