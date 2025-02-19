// config/kafkaClient.js
const { Kafka } = require('kafkajs')
require('dotenv').config()

const kafka = new Kafka({
  clientId: 'iiita-flix-transcoder-service',
  brokers: [process.env.KAFKA_BROKER || '192.168.43.179:9092']
})

module.exports = kafka
