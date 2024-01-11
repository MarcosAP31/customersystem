const uuid = require('uuid');

const tokens = []; // Almacenar tokens generados

module.exports = [
    {
        method: 'POST',
        path: '/generate-token',
        handler: (request, h) => {
            const newToken = uuid.v4().substr(0, 8);
            
            // Registra el token en la tabla (en este caso, un simple array)
            tokens.push(newToken);

            return {
                token: newToken,
            };
        },
    },
    {
        method: 'POST',
        path: '/validate-token',
        handler: (request, h) => {
            const { token } = request.payload;

            // Verifica si el token existe en la tabla
            const isValid = tokens.includes(token);

            return {
                isValid,
            };
        },
    },
];