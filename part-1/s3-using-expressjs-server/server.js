const express = require("express")
const app = express()
app.use(express.json())

const get_user = require("./routes/get_user")

app.use("/app/user-details", get_user)

app.get("/app/user", (req, res) => {
  res.status(200).json({
    message: "Query parameters received",
    queryParams: req.query,
  })
})

app.get("/app/user/:id", (req, res) => {
  res.status(200).json({
    message: "Path parameter received",
    userId: req.params.id,
  })
})

app.post("/app/user", (req, res) => {
  const { name, email } = req.body

  if (!name || !email) {
    return res.status(400).json({
      error: "name and email are required",
    })
  }

  res.status(201).json({
    message: "User created",
    user: {
      id: Date.now(),
      name,
      email,
    },
  })
})

app.use((req, res) => {
  res.status(404).json({
    error: "Route not found",
  })
})

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000")
})
