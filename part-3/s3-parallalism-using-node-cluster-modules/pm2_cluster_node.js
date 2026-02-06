require('dotenv').config()
const express = require('express')
const helmet = require('helmet')
const compression = require('compression')
const zlib = require('zlib')

const port = process.env.PORT || 3000
const routes = require('./app')

const app = express()

/**
 * -------------------------
 * Security hardening
 * -------------------------
 */

/**
 * Helmet sets secure HTTP headers:
 * - Hides implementation details
 * - Protects against common web vulnerabilities
 * - Adds sane defaults for production APIs
 */
app.use(helmet())

/**
 * Disable `X-Powered-By: Express`
 * Prevents leaking framework information
 */
app.disable('x-powered-by')

/**
 * -------------------------
 * Middleware
 * -------------------------
 */

/**
 * Body parsing
 */
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

/**
 * Gzip / Brotli compression using zlib
 * - Reduces response size
 * - Improves network performance
 * - Uses best compression level for production
 */
app.use(
  compression({
    level: zlib.constants.Z_BEST_COMPRESSION,
    threshold: 1024, // only compress responses > 1KB
  })
)

/**
 * -------------------------
 * Healthcheck
 * -------------------------
 * Used by:
 * - Load balancers
 * - ECS / Kubernetes
 * - Monitoring systems
 */
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Service is running',
    pid: process.pid,
  })
})

/**
 * -------------------------
 * Routes
 * -------------------------
 */
app.use(routes)

app.listen(port, () => {
  console.log(`Server running on port ${port} (PID ${process.pid})`)
})
