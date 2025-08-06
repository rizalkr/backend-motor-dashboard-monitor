const { Pool } = require('pg');
require('dotenv').config();

// Create PostgreSQL connection pool
// Support both connection URL (for cloud databases like Neon) and individual parameters
const poolConfig = process.env.DB_URL ? {
  connectionString: process.env.DB_URL,
  ssl: {
    rejectUnauthorized: false // Required for Neon and other cloud PostgreSQL providers
  }
} : {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
};

// Optimize connection pool for serverless/Vercel
const connectionPoolConfig = {
  max: process.env.VERCEL ? 1 : 20, // Limit connections in serverless
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 10000, // Increase timeout for cloud databases
  statement_timeout: 30000, // 30 second statement timeout
  query_timeout: 30000, // 30 second query timeout
};

const pool = new Pool({ ...poolConfig, ...connectionPoolConfig });

// Test database connection
pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Helper function to execute queries
const query = async (text, params) => {
  const start = Date.now();
  const client = await pool.connect();
  
  try {
    const res = await client.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  } finally {
    client.release();
  }
};

module.exports = {
  pool,
  query
};
