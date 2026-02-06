require('dotenv').config()
const express = require('express')
const cluster = require('node:cluster')
const numCPUs = require('node:os').availableParallelism()
const compression = require('compression')

const port = process.env.PORT || 3000
const routes = require('./app')

// Function to create and set up the Express app
const createApp = () => {
    const app = express()

    /** ECS Healthcheck Endpoint */
    app.get('/', (req, res) => {
        res.status(200).json({
            status: 'OK',
            message: 'Service is running',
        })
    })

    app.use(express.urlencoded({ extended: true }))
    app.use(express.json())
    app.use(compression())
    app.use(routes)

    return app
}

// Function to start the server
const startServer = () => {
    const app = createApp()

    app.listen(port, () => {
        console.log(`Worker ${process.pid} listening on http://localhost:${port}`)
    })
}

// Cluster logic
if (cluster.isPrimary) {
    console.log(`Primary ${process.pid} is running`)
    console.log(`Forking ${numCPUs} workers...`)

    for (let i = 0; i < numCPUs; i++) {
        cluster.fork()
    }

    cluster.on('exit', (worker, code, signal) => {
        console.log(
            `Worker ${worker.process.pid} died (code: ${code}, signal: ${signal}). Restarting...`
        )
        cluster.fork()
    })
} else {
    startServer()
}
