const mysql = require('mysql2');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'RP738964$',
  database: 'petcare',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const db = {
  query: (...args) => pool.query(...args),
  getConnection: (callback) => pool.getConnection(callback),
  pool
};

module.exports = db;
