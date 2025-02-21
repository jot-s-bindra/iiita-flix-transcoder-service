// kafka/kafkaConsumer.js
const kafka = require('../config/kafkaClient');
const { ECSClient, RunTaskCommand } = require('@aws-sdk/client-ecs');
require('dotenv').config();

// ✅ Initialize ECS Client
const ecsClient = new ECSClient({ region: process.env.AWS_REGION });

// ✅ Function to Trigger ECS Task
async function runEcsTask(userId, title, uploadServiceUrl, transcoderServiceUrl) {
    try {
        const command = new RunTaskCommand({
            cluster: process.env.ECS_CLUSTER_NAME,
            taskDefinition: process.env.ECS_TASK_DEFINITION,
            launchType: 'FARGATE',
            count: 1,
            networkConfiguration: {
                awsvpcConfiguration: {
                    assignPublicIp: 'ENABLED',
                    subnets: [process.env.SUBNET_1, process.env.SUBNET_2],
                    securityGroups: [process.env.SECURITY_GROUP_ID]
                }
            },
            overrides: {
                containerOverrides: [{
                    name: 'iiita-flix-ffmpeg-container',
                    environment: [
                        { name: 'USER_ID', value: userId },
                        { name: 'TITLE', value: title },
                        { name: 'UPLOAD_SERVICE_URL', value: uploadServiceUrl },
                        { name: 'TRANSCODER_SERVICE_URL', value: transcoderServiceUrl }
                    ]
                }]
            }
        });

        await ecsClient.send(command);
        console.log(`✅ ECS Task Started for User: ${userId}, Title: ${title}`);
    } catch (error) {
        console.error(`❌ Failed to start ECS Task for User: ${userId}, Title: ${title}`, error);
    }
}

async function startKafkaConsumer() {
    let consumer;

    try {
        console.log('🔥 Kafka Consumer: Starting...');

        consumer = kafka.consumer({ groupId: process.env.TRANSCODER_GROUP_ID || 'transcoder-service-group' });
        console.log('🛜 Kafka Consumer: Connecting...');

        await consumer.connect();
        console.log('✅ Kafka Consumer Connected to Kafka Broker');

        const topic = 'video-uploaded-to-temp-transcode';
        await consumer.subscribe({ topic, fromBeginning: false });
        console.log(`📡 Kafka Consumer Subscribed to Topic: ${topic}`);

        await consumer.run({
            eachBatch: async ({ batch, heartbeat }) => {
                console.log(`🔥 Kafka Consumer: Processing Batch - ${batch.messages.length} messages`);

                try {
                    const messages = batch.messages.map((msg) => {
                        try {
                            return JSON.parse(msg.value.toString()); // Handle JSON parsing
                        } catch (err) {
                            console.warn(`⚠️ Skipping invalid JSON message: ${msg.value.toString()}`);
                            return null;
                        }
                    }).filter(Boolean); // Filter out null values

                    // ✅ Process messages in chunks of 10
                    for (let i = 0; i < messages.length; i += 10) {
                        const chunk = messages.slice(i, i + 10); // Get next 10 messages or fewer
                        console.log(`🚀 Processing Chunk of ${chunk.length} messages`);

                        const tasks = chunk.map(async (data) => {
                            console.log(`👉 Received Video for User: ${data.userId}, Title: ${data.title}`);
                            await runEcsTask(
                                data.userId,
                                data.title,
                                process.env.UPLOAD_SERVICE_URL,
                                process.env.TRANSCODER_SERVICE_URL
                            );
                        });

                        await Promise.all(tasks); // Wait for ECS tasks to complete for this chunk
                    }

                    console.log(`✅ All Messages in Batch Processed`);
                    await heartbeat(); // ✅ Ensure Kafka doesn't rebalance
                } catch (err) {
                    console.error('❌ Error processing batch:', err);
                }
            }
        });

        console.log('✅ Kafka Consumer is Running...');
    } catch (err) {
        console.error('❌ Kafka Consumer Error:', err);
    }

    // ✅ Graceful shutdown on process exit
    const shutdown = async () => {
        if (consumer) {
            console.log('⚠️ Kafka Consumer: Disconnecting...');
            await consumer.disconnect();
            console.log('✅ Kafka Consumer: Disconnected');
            process.exit(0);
        }
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
}

// ✅ Correct Export
module.exports = startKafkaConsumer;

