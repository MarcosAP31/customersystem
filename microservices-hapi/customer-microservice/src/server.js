const Hapi = require('@hapi/hapi');
const routes = require('./routes');
const Redis = require('redis');
const { promisify } = require('util');

const init = async () => {
    // Crear instancia del servidor Hapi
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

    // Conectar a Redis
    await new Promise((resolve) => {
        redisClient.connect(() => {
            console.log('Connected to Redis');
            resolve();
        });
    });

    // Funciones promisificadas
    const getAsync = promisify(redisClient.get).bind(redisClient);
    const setAsync = promisify(redisClient.set).bind(redisClient);

    try {
        // Registrar parámetros globales en Redis al iniciar el microservicio
        await setAsync('sendEmailEnabled', 'true'); 

        // Consultar parámetro de envío de correos al inicio del microservicio
        const sendEmailParam = await getAsync('sendEmailEnabled');

        // Registra las rutas desde el archivo de rutas
        server.route(routes);

        // Iniciar el servidor Hapi
        await server.start();
        console.log('Customer Microservice running on %s', server.info.uri);
        console.log('Send email parameter from Redis:', sendEmailParam);
    } catch (error) {
        console.error('Error initializing the server:', error);
        process.exit(1);
    } finally {
        // Cierra la conexión a Redis de manera asíncrona y espera a que se complete
        await new Promise((resolve) => {
            redisClient.quit(() => {
                console.log('Redis client closed.');
                resolve();
            });
        });
    }
};

init();