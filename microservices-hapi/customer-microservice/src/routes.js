const Joi = require('@hapi/joi');
const amqp = require('amqplib');
const { validateToken } = require('../security-microservice/src/securityUtils');

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

                // Realizar el registro del customere en la base de datos
                const { Name, Email, Phone } = request.payload;

                // Puedes agregar más validaciones antes de realizar el registro

                const RegistrationDate = new Date().toISOString();

                // Registrar customere en la base de datos
                const [CustomerId] = await pool.execute('INSERT INTO customers (Name, Email, Phone, RegistrationDate) VALUES (?, ?, ?, ?)', [Name, Email, Phone, RegistrationDate]);

                // Consultar el parámetro de envío de correos en Redis
                const sendEmailEnabled = await getAsync('sendEmailEnabled');

                if (sendEmailEnabled === 'true') {
                    // Enviar mensaje a RabbitMQ para solicitar el envío de correo
                    const connection = await amqp.connect('amqp://localhost');
                    const channel = await connection.createChannel();
                    const queue = 'sendEmailQueue';

                    const customerData = {
                        CustomerId,
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