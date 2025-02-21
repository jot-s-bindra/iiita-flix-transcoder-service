// server.js
const express = require('express')
require('dotenv').config()

const startKafkaConsumer = require('./kafka/kafkaConsumer')
const testRoute = require('./routes/testRoute')

const app = express()
const PORT = process.env.PORT || 6000

// ✅ Middleware
app.use(express.json())

// ✅ Routes
app.use('/', testRoute)
app.post('/api/transcode-status', (req, res) => {
  const { userId, title, status } = req.body

  if (!userId || !title || !status) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  console.log(`📡 Received Transcode Status: ${status}`)
  console.log(`👤 User: ${userId}, 🎬 Title: ${title}`)

  res.json({ message: 'Transcode status received successfully' })
})

// ✅ Start Kafka Consumer If Enabled
if (process.env.RUN_KAFKA_CONSUMER === 'true') {
  startKafkaConsumer().catch(err => console.error('❌ Kafka Consumer Error:', err))
}

// ✅ Start Express Server
app.listen(PORT, () => {
  console.log(`🚀 Transcoder Service is running on port ${PORT}`)
})
