const Joi = require('@hapi/joi');
const { generateToken, validateToken } = require('./tokenHandler');

const generateTokenHandler = async (request, h) => {
    try {
        const newToken = await generateToken();
        return {
            token: newToken,
        };
    } catch (error) {
        console.error('Error generating token:', error.message);
        return h.response('Internal Server Error').code(500);
    }
};

const validateTokenHandler = async (request, h) => {
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
};

module.exports = [
    {
        method: 'POST',
        path: '/generate-token',
        handler: generateTokenHandler,
    },
    {
        method: 'POST',
        path: '/validate-token',
        handler: validateTokenHandler,
        options: {
            validate: {
                payload: Joi.object({
                    token: Joi.string().required(),
                }),
            },
        },
    },
];