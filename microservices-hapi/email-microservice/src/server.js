const Hapi = require('@hapi/hapi');
const amqp = require('amqplib');
const { createConnection } = require('mysql2/promise');

const init = async () => {
    const server = Hapi.server({
        port: 3005,
        host: 'localhost',
    });

    // Configurar conexión MySQL
    const dbConnection = await createConnection({
        host: 'localhost',
        user: 'root',
        password: 'SQLPassword',
        database: 'customersystem',
    });

    // Configurar conexión RabbitMQ
    const connection = await amqp.connect('amqp://localhost');
    const channel = await connection.createChannel();
    const queue = 'sendEmailQueue';

    channel.assertQueue(queue, { durable: false });
    channel.consume(queue, (msg) => {
        const emailData = JSON.parse(msg.content.toString());
        saveSentEmail(dbConnection, emailData);
        console.log('Received message from sendEmailQueue:', emailData);
    }, { noAck: true });

    await server.start();
    console.log('Email Microservice running on %s', server.info.uri);
};

const saveSentEmail = async (dbConnection, emailData) => {
    const { recipientEmail, subject, body } = emailData;
    const query = 'INSERT INTO sent_emails (recipient_email, subject, body) VALUES (?, ?, ?)';
    
    await dbConnection.execute(query, [recipientEmail, subject, body]);
};

init();