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
     const redisClient = Redis.createClient({
        legacyMode: true,
        host: '192.168.1.197',
        port: 6379,
    });

     // Manejar eventos de error y de conexión
     redisClient.on('error', (err) => {
        console.error('Redis error:', err);
    });

    redisClient.connect().then(() => {
        console.log('Connected to Redis');
    })

    // Funciones promisificadas
    const getAsync = promisify(redisClient.get).bind(redisClient);
    const setAsync = promisify(redisClient.set).bind(redisClient);

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