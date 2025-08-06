#!/usr/bin/env node

/**
 * Quick Database Status Check
 * A simple script to quickly check if the database is ready
 */

const { Pool } = require('pg');
require('dotenv').config();

// Configure database connection - prioritize DB_URL for cloud databases like Neon
const dbConfig = process.env.DB_URL 
  ? { 
      connectionString: process.env.DB_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      connectionTimeoutMillis: 5000,
    }
  : {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME || 'vehicle_maintenance',
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      connectionTimeoutMillis: 3000,
    };

const pool = new Pool(dbConfig);

async function quickCheck() {
  try {
    const client = await pool.connect();
    
    // Quick table check
    const result = await client.query(`
      SELECT COUNT(*) as table_count 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('users', 'vehicles', 'oil_changes', 'fuel_records')
    `);
    
    const tableCount = parseInt(result.rows[0].table_count);
    
    client.release();
    
    if (tableCount === 4) {
      console.log('✅ Database is ready! All tables exist.');
      process.exit(0);
    } else {
      console.log(`⚠️  Database partially ready. Found ${tableCount}/4 tables.`);
      console.log('Run: npm run setup-db or ./setup-database.sh');
      process.exit(1);
    }
    
  } catch (error) {
    console.log('❌ Database not ready.');
    console.log(`Error: ${error.message}`);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 Is PostgreSQL running?');
    } else if (error.code === '3D000') {
      console.log('💡 Database does not exist. Run: ./setup-database.sh');
    }
    
    process.exit(1);
  } finally {
    await pool.end();
  }
}

quickCheck();
