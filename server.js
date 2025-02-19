// server.js
const express = require('express')
require('dotenv').config()

const app = express()
const PORT = process.env.PORT || 6000

// Middleware
app.use(express.json())

// Test Route
app.get('/', (req, res) => {
  res.send('Transcoder Service is Running 🚀')
})

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Transcoder Service is running on port ${PORT}`)
})
