const Hapi = require('@hapi/hapi');
const routes = require('./routes');

const init = async () => {
    const server = Hapi.server({
        port: 3006,
        host: 'localhost',
    });

    try {
        // Registra las rutas desde el archivo de rutas
        server.route(routes);

        // Inicia el servidor Hapi
        await server.start();

        console.log('Security Microservice is running at: %s', server.info.uri);
    } catch (error) {
        console.error('Error starting the server:', error);
        process.exit(1);
    }
};

init();