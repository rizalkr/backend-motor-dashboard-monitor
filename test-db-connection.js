#!/usr/bin/env node

/**
 * Database Connection Test Script
 * This script tests the PostgreSQL database connection and verifies the schema
 */

const { Pool } = require('pg');
require('dotenv').config();

// Configure database connection - prioritize DB_URL for cloud databases like Neon
const dbConfig = process.env.DB_URL 
  ? { 
      connectionString: process.env.DB_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      connectionTimeoutMillis: 10000,
    }
  : {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME || 'vehicle_maintenance',
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      connectionTimeoutMillis: 5000,
    };

const pool = new Pool(dbConfig);

async function testDatabaseConnection() {
  console.log('🔍 Testing database connection...\n');
  
  try {
    // Test basic connection
    console.log('1. Testing basic connection...');
    const client = await pool.connect();
    console.log(' Database connection successful');
    
    // Test database version
    console.log('\n2. Checking PostgreSQL version...');
    const versionResult = await client.query('SELECT version()');
    console.log(` PostgreSQL Version: ${versionResult.rows[0].version.split(' ')[1]}`);
    
    // Test current database
    console.log('\n3. Checking current database...');
    const dbResult = await client.query('SELECT current_database()');
    console.log(` Connected to database: ${dbResult.rows[0].current_database}`);
    
    // Test schema - check if tables exist
    console.log('\n4. Verifying database schema...');
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);
    
    const expectedTables = ['users', 'vehicles', 'oil_changes', 'fuel_records'];
    const existingTables = tablesResult.rows.map(row => row.table_name);
    
    console.log(` Found tables: ${existingTables.join(', ')}`);
    
    // Check if all required tables exist
    const missingTables = expectedTables.filter(table => !existingTables.includes(table));
    if (missingTables.length > 0) {
      console.log(`  Missing tables: ${missingTables.join(', ')}`);
      console.log('   Run the database_schema.sql file to create missing tables');
    } else {
      console.log(' All required tables exist');
    }
    
    // Test table structure for main tables
    if (existingTables.includes('users')) {
      console.log('\n5. Checking users table structure...');
      const usersColumns = await client.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        ORDER BY ordinal_position
      `);
      console.log(' Users table columns:', usersColumns.rows.map(r => `${r.column_name} (${r.data_type})`).join(', '));
    }
    
    // Test write permissions
    console.log('\n6. Testing write permissions...');
    await client.query('BEGIN');
    await client.query('CREATE TEMP TABLE test_table (id SERIAL PRIMARY KEY, test_data TEXT)');
    await client.query('INSERT INTO test_table (test_data) VALUES ($1)', ['test']);
    const testResult = await client.query('SELECT * FROM test_table');
    await client.query('ROLLBACK');
    console.log(' Write permissions working correctly');
    
    client.release();
    
    console.log('\n Database is ready and properly configured!');
    console.log('\nNext steps:');
    console.log('- Start the server with: npm start or npm run dev');
    console.log('- Test the API health endpoint: curl http://localhost:3000/health');
    
  } catch (error) {
    console.error('\n Database connection failed:');
    console.error(`Error: ${error.message}`);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 Troubleshooting tips:');
      console.error('1. Make sure PostgreSQL is running');
      console.error('2. Check your database connection settings in .env file');
      console.error('3. Verify the database exists');
      console.error('4. Check if the user has proper permissions');
    } else if (error.code === '3D000') {
      console.error('\n💡 Database does not exist. Create it with:');
      console.error('createdb vehicle_maintenance');
    } else if (error.code === '28P01') {
      console.error('\n💡 Authentication failed. Check your username/password in .env');
    }
    
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Handle script termination
process.on('SIGINT', async () => {
  console.log('\n\n🛑 Script interrupted');
  await pool.end();
  process.exit(0);
});

// Run the test
testDatabaseConnection();
