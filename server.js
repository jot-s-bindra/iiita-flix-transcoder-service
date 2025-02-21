// server.js
const express = require('express')
require('dotenv').config()
const { sendKafkaEvent } = require('./kafka/kafkaProducer'); // ✅ Import Kafka Producer

const startKafkaConsumer = require('./kafka/kafkaConsumer')
const testRoute = require('./routes/testRoute')

const app = express()
const PORT = process.env.PORT || 6000

// ✅ Middleware
app.use(express.json())

// ✅ Routes
app.use('/', testRoute)

app.post('/api/transcode-status', async (req, res) => {
    const { userId, title, status } = req.body;

    if (!userId || !title || !status) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    console.log(`📡 Received Transcode Status: ${status}`);
    console.log(`👤 User: ${userId}, 🎬 Title: ${title}`);

    try {
        // ✅ Produce Kafka Event to Topic: transcoder-status-update
        const payload = {
            userId,
            title,
            status,
            timestamp: new Date().toISOString()
        };

        await sendKafkaEvent('transcoder-status-update', payload);
        console.log(`✅ Kafka Event Sent: transcoder-status-update for User: ${userId}, Title: ${title}`);

        res.json({ message: 'Transcode status received and Kafka event sent successfully' });
    } catch (error) {
        console.error('❌ Error sending Kafka event:', error);
        res.status(500).json({ error: 'Error sending Kafka event' });
    }
});


// ✅ Start Kafka Consumer If Enabled
if (process.env.RUN_KAFKA_CONSUMER === 'true') {
  startKafkaConsumer().catch(err => console.error('❌ Kafka Consumer Error:', err))
}

// ✅ Start Express Server
app.listen(PORT, () => {
  console.log(`🚀 Transcoder Service is running on port ${PORT}`)
})
