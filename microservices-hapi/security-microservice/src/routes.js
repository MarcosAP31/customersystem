const Joi = require('@hapi/joi');
const { generateToken, validateToken } = require('./tokenHandler');

module.exports = [
    {
        method: 'POST',
        path: '/generate-token',
        handler: async (request, h) => {
            try {
                const newToken = await generateToken();
                return {
                    token: newToken,
                };
            } catch (error) {
                console.error('Error generating token:', error.message);
                return h.response('Internal Server Error').code(500);
            }
        },
    },
    {
        method: 'POST',
        path: '/validate-token',
        handler: async (request, h) => {
            try {
                const { token } = request.payload;
                const isValid = await validateToken(token);
                return {
                    isValid,
                };
            } catch (error) {
                console.error('Error validating token:', error.message);
                return h.response('Internal Server Error').code(500);
            }
        },
        options: {
            validate: {
                payload: Joi.object({
                    token: Joi.string().required(),
                }),
            },
        },
    },
];