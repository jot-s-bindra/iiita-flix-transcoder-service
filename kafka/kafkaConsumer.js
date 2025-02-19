// kafka/kafkaConsumer.js
const kafka = require('../config/kafkaClient')

async function startKafkaConsumer() {
  try {
    console.log('🔥 Kafka Consumer: Starting...')

    const consumer = kafka.consumer({ groupId: process.env.TRANSCODER_GROUP_ID || 'transcoder-service-group' })
    console.log('🛜 Kafka Consumer: Connecting...')

    await consumer.connect()
    console.log('✅ Kafka Consumer Connected to Kafka Broker')

    const topic = 'video-uploaded-to-temp-transcode'
    await consumer.subscribe({ topic, fromBeginning: false })
    console.log(`📡 Kafka Consumer Subscribed to Topic: ${topic}`)

    await consumer.run({
      eachBatch: async ({ batch, heartbeat }) => {
        const messages = batch.messages.map((msg) => JSON.parse(msg.value.toString()))
        console.log(`🔥 Kafka Consumer: Processing Batch - ${messages.length} messages`)

        try {
          for (const data of messages) {
            console.log(`👉 Received Video for User: ${data.userId}, Title: ${data.title}`)

            // ✅ Simulate Success or Failure
            const transcodingStatus = 'done' // or 'error' in case of failure
            console.log(`🚀 Transcoding Completed: Status - ${transcodingStatus}`)
          }

          await heartbeat()
        } catch (err) {
          console.error('❌ Error processing batch:', err)
        }
      }
    })

    console.log('✅ Kafka Consumer is Running...')
  } catch (err) {
    console.error('❌ Kafka Consumer Error:', err)
  }
}

// ✅ Correct Export
module.exports = startKafkaConsumer
