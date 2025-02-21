// kafka/kafkaProducer.js
const kafka = require('../config/kafkaClient');

const producer = kafka.producer();

async function sendKafkaEvent(topic, message) {
    try {
        await producer.connect();
        await producer.send({
            topic,
            messages: [{ value: JSON.stringify(message) }]
        });
        console.log(`✅ Kafka Event Produced - Topic: ${topic}`);
    } catch (error) {
        console.error('❌ Kafka Producer Error:', error);
    } finally {
        await producer.disconnect();
    }
}

module.exports = { sendKafkaEvent };
