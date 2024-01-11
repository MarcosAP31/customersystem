const Joi = require('@hapi/joi');
const amqp = require('amqplib');
const { createConnection } = require('mysql2/promise');
const { promisify } = require('util');

const pool = createConnection({
    host: 'localhost',
    user: 'marcos',
    password: 'SQLPassword',
    database: 'customersystem',
});

// Funciones promisificadas para Redis
const getAsync = promisify(redisClient.get).bind(redisClient);
const setAsync = promisify(redisClient.set).bind(redisClient);

module.exports = [
    {
        method: 'POST',
        path: '/register-customer',
        handler: async (request, h) => {
            try {
                // Validar el token con el microservicio de seguridad (debes implementar esto)
                const isValidToken = await validateToken(request.headers.authorization);

                if (!isValidToken) {
                    return h.response('Token not valid').code(401);
                }

                const { Name, Email, Phone } = request.payload;
                const registrationDate = new Date().toISOString();

                // Registrar customer en la base de datos
                const [customerId] = await pool.execute(
                    'INSERT INTO customer (Name, Email, Phone, RegistrationDate) VALUES (?, ?, ?, ?)',
                    [Name, Email, Phone, registrationDate]
                );

                // Consultar el parámetro de envío de correos en Redis
                const sendEmailEnabled = await getAsync('sendEmailEnabled');

                if (sendEmailEnabled === 'true') {
                    // Enviar mensaje a RabbitMQ para solicitar el envío de correo
                    const connection = await amqp.connect('amqp://localhost');
                    const channel = await connection.createChannel();
                    const queue = 'sendEmailQueue';

                    const customerData = {
                        CustomerId: customerId,
                        Name,
                        Email,
                        Phone,
                    };

                    channel.assertQueue(queue, { durable: false });
                    channel.sendToQueue(queue, Buffer.from(JSON.stringify(customerData)));

                    console.log(`Message sent to ${queue}: ${JSON.stringify(customerData)}`);

                    setTimeout(() => {
                        connection.close();
                    }, 500);
                }

                return h.response('Customer registered successfully').code(201);
            } catch (error) {
                console.error('Error registering customer:', error.message);
                return h.response('Internal Server Error').code(500);
            }
        },
        options: {
            validate: {
                payload: Joi.object({
                    Name: Joi.string().required(),
                    Email: Joi.string().email().required(),
                    Phone: Joi.string().required(),
                }),
            },
        },
    },
];