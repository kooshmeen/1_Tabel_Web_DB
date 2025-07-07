const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

// Test conexiunea
pool.on('connect', () => {
  console.log('✅ Conectat la PostgreSQL');
});

pool.on('error', (err) => {
  console.error('❌ Eroare PostgreSQL:', err);
});

module.exports = pool;