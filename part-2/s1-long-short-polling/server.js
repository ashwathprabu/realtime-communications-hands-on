const express = require("express")
const EventEmitter = require("events")

const app = express()
const weatherChange = new EventEmitter()

// Current weather state
const weathers = {
  Berlin: 10,
  Vienna: 12,
  Paris: 14,
  Madrid: 18
}

// Helper
function isEmpty(obj) {
  return Object.keys(obj).length === 0
}

// Simulate third-party weather updates
function getWeatherChangesFromThirdParty() {
  const changes = {}

  function updateCity(city) {
    const delta = Math.ceil(Math.random() * 3 - 2) // -1, 0, +1
    if (delta !== 0) {
      weathers[city] += delta
      changes[city] = weathers[city]
    }
  }

  updateCity("Berlin")
  updateCity("Vienna")
  updateCity("Paris")
  updateCity("Madrid")

  if (!isEmpty(changes)) {
    weatherChange.emit("new_change", changes)
  }
}

// Poll third-party API every 5 seconds
setInterval(getWeatherChangesFromThirdParty, 5000)

// Get current weather (normal HTTP)
app.get("/weather", (req, res) => {
  res.json(weathers)
})

// Long-polling endpoint
app.get("/weather/update", (req, res) => {
  const timeout = setTimeout(() => {
    res.status(204).end() // No changes
    weatherChange.removeListener("new_change", handler)
  }, 25000) // 25s timeout

  const handler = (changes) => {
    clearTimeout(timeout)
    res.json(changes)
    weatherChange.removeListener("new_change", handler)
  }

  weatherChange.on("new_change", handler)

  // Cleanup if client disconnects
  req.on("close", () => {
    clearTimeout(timeout)
    weatherChange.removeListener("new_change", handler)
  })
})

app.listen(3000, () => {
  console.log("Weather API running on http://localhost:3000")
})
