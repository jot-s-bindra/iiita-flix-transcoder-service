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

// ✅ Start Kafka Consumer If Enabled
if (process.env.RUN_KAFKA_CONSUMER === 'true') {
  startKafkaConsumer().catch(err => console.error('❌ Kafka Consumer Error:', err))
}

// ✅ Start Express Server
app.listen(PORT, () => {
  console.log(`🚀 Transcoder Service is running on port ${PORT}`)
})
