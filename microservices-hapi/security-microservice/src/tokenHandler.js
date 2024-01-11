const { createConnection } = require('mysql2/promise');
const uuid = require('uuid');

const pool = createConnection({
    host: 'localhost',
    user: 'marcos',
    password: 'SQLPassword',
    database: 'customersystem',
});

const generateToken = async () => {
    try {
        const newToken = uuid.v4().substr(0, 8);
        await pool.execute('INSERT INTO token (Token) VALUES (?)', [newToken]);
        return newToken;
    } catch (error) {
        console.error('Error generating token:', error);
        throw new Error('Unable to generate token');
    }
};

const validateToken = async (token) => {
    try {
        const [results] = await pool.execute('SELECT * FROM token WHERE Token = ?', [token]);
        return results.length > 0;
    } catch (error) {
        console.error('Error validating token:', error);
        throw new Error('Unable to validate token');
    }
};

module.exports = { generateToken, validateToken };