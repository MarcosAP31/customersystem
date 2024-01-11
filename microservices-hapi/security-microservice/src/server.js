const Hapi = require('@hapi/hapi');
const routes = require('./routes');

const init = async () => {
    const server = Hapi.server({
        port: 3006,
        host: 'localhost',
    });

    // Registra las rutas desde el archivo de rutas
    server.route(routes);

    await server.start();
    console.log('Security Microservice running on %s', server.info.uri);
};

init();