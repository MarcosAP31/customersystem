const Hapi = require('@hapi/hapi');
const amqp = require('amqplib');
const { createConnection } = require('mysql2/promise');

const init = async () => {
    try {
        const server = await setupServer();

        // Configurar conexión MySQL
        const dbConnection = await createConnection({
            host: 'localhost',
            user: 'marcos',
            password: 'SQLPassword',
            database: 'customersystem',
        });

        // Configurar conexión RabbitMQ
        const channel = await setupRabbitMQ();

        // Consumir mensajes del RabbitMQ
        consumeMessages(channel, dbConnection);

        await server.start();
        console.log('Email Microservice running on %s', server.info.uri);
    } catch (error) {
        console.error('Error starting the server:', error);
        process.exit(1); // Salir del proceso si hay un error durante la inicialización
    }
};

const setupServer = async () => {
    const server = Hapi.server({
        port: 3005,
        host: 'localhost',
    });

    return server;
};

const setupRabbitMQ = async () => {
    const connection = await amqp.connect('amqp://localhost');
    const channel = await connection.createChannel();
    const queue = 'sendEmailQueue';

    await channel.assertQueue(queue, { durable: false });

    return channel;
};

const consumeMessages = (channel, dbConnection) => {
    channel.consume('sendEmailQueue', (msg) => {
        try {
            const emailData = JSON.parse(msg.content.toString());
            saveSentEmail(dbConnection, emailData);
            console.log('Received message from sendEmailQueue:', emailData);
        } catch (error) {
            console.error('Error processing message:', error);
        }
    }, { noAck: true });
};

const saveSentEmail = async (dbConnection, emailData) => {
    try {
        const { Receiver, Subject, Body } = emailData;
        const query = 'INSERT INTO sent_email (Receiver, Subject, Body) VALUES (?, ?, ?)';
        
        await dbConnection.execute(query, [Receiver, Subject, Body]);
    } catch (error) {
        console.error('Error saving email:', error);
    }
};

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

init();