const express = require('express')
const compression = require('compression')

const port = 3000


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

    return app
}

// Function to start the server
const startServer = async () => {
    try {

        const app = createApp()
        app.listen(port, () => {
            console.log(`Server is running on http://localhost:${port}`)
        })
    } catch (error) {
        console.error(error)
        process.exit(1) // Exit process with failure
    }
}

startServer()