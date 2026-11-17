const mysql = require('mysql2');

// MySQL Connection
const connection = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'petcare',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = connection;
