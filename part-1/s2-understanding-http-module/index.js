const http = require("http")
const url = require("url")

// ---------- Helpers ----------

// Send JSON response
function sendJson(res, statusCode, payload) {
  const body = JSON.stringify(payload)

  res.writeHead(statusCode, {
    "Content-Type": "application/json",
    "Content-Length": Buffer.byteLength(body),
  })

  res.end(body)
}

// Parse JSON body manually
function parseBody(req) {
  return new Promise((resolve, reject) => {
    let data = ""

    req.on("data", (chunk) => {
      data += chunk.toString()
    })

    req.on("end", () => {
      if (!data) return resolve({})
      try {
        resolve(JSON.parse(data))
      } catch (err) {
        reject(new Error("Invalid JSON body"))
      }
    })
  })
}

// ---------- Server ----------
const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true)
  const pathname = parsedUrl.pathname
  const query = parsedUrl.query
  const method = req.method

  // Split path for manual path param handling
  const pathParts = pathname.split("/").filter(Boolean)
  // e.g. "/app/user/123" => ["app", "user", "123"]

  // --------------------------------------------------
  // GET /app/user?role=admin&active=true
  // Query parameters demo
  // --------------------------------------------------
  if (method === "GET" && pathname === "/app/user") {
    return sendJson(res, 200, {
      message: "Query parameters received",
      queryParams: query,
    })
  }

  // --------------------------------------------------
  // GET /app/user/:id
  // Path parameters demo
  // --------------------------------------------------
  if (
    method === "GET" &&
    pathParts.length === 3 &&
    pathParts[0] === "app" &&
    pathParts[1] === "user"
  ) {
    const userId = pathParts[2]

    return sendJson(res, 200, {
      message: "Path parameter received",
      userId: userId,
    })
  }

  // --------------------------------------------------
  // POST /app/user
  // Body parsing demo
  // --------------------------------------------------
  if (method === "POST" && pathname === "/app/user") {
    try {
      const body = await parseBody(req)

      if (!body.name || !body.email) {
        return sendJson(res, 400, {
          error: "name and email are required",
        })
      }

      return sendJson(res, 201, {
        message: "User created",
        user: {
          id: Date.now(),
          name: body.name,
          email: body.email,
        },
      })
    } catch (err) {
      return sendJson(res, 400, {
        error: err.message,
      })
    }
  }

  // --------------------------------------------------
  // Fallback
  // --------------------------------------------------
  sendJson(res, 404, {
    error: "Route not found",
  })
})

// ---------- Boot ----------

server.listen(3000, () => {
  console.log("Server running on http://localhost:3000")
})
