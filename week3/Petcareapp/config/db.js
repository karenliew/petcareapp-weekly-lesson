const mysql = require('mysql2');

// MySQL Connection
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: process.env.DB_PASSWORD,
  database: 'petcare'
});

module.exports = connection;
