const Hapi = require('@hapi/hapi');
const routes = require('./routes');
const Redis = require('redis');
const { promisify } = require('util');

const init = async () => {
    const server = Hapi.server({
        port: 3004,
        host: 'localhost',
    });

    // Configurar conexión Redis
    const redisClient = Redis.createClient();
    const getAsync = promisify(redisClient.get).bind(redisClient);

    // Registrar parámetros globales en Redis al iniciar el microservicio
    await setAsync('sendEmailEnabled', 'true'); // Puedes ajustar el valor según tus necesidades

    // Consultar parámetro de envío de correos al inicio del microservicio
    const sendEmailParam = await getAsync('sendEmailEnabled');

    // Registra las rutas desde el archivo de rutas
    server.route(routes);

    await server.start();
    console.log('Customer Microservice running on %s', server.info.uri);

    console.log('Send email parameter from Redis:', sendEmailParam);
};

init();