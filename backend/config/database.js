
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'placement_platform',
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: process.env.NODE_ENV === 'production' && process.env.DB_HOST !== 'postgres' 
    ? { rejectUnauthorized: false } 
    : false,
  // Connection pool settings
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test the connection with retry logic
const connectWithRetry = () => {
  pool.connect((err, client, release) => {
    if (err) {
      console.error('❌ Failed to connect to PostgreSQL:', err.message);
      console.log('🔄 Retrying connection in 5 seconds...');
      setTimeout(connectWithRetry, 5000);
    } else {
      console.log('✅ Connected to PostgreSQL database');
      release();
    }
  });
};

// Initial connection attempt
connectWithRetry();

pool.on('connect', () => {
  console.log('✅ New client connected to PostgreSQL');
});

pool.on('error', (err) => {
  console.error('❌ PostgreSQL connection error:', err);
  console.log('🔄 Attempting to reconnect...');
});

module.exports = pool;
