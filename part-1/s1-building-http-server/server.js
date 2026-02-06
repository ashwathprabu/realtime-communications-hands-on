const http = require('http')

const server = http.createServer((req, res) => {
  console.log('Incoming request:', req.method, req.url)

  res.statusCode = 200
  res.setHeader('Content-Type', 'text/plain')
  res.end('Hello from Node HTTP server\n')
})

server.listen(3000, () => {
  console.log('Server running at http://localhost:3000/')
})
