#!/usr/bin/env node

/**
 * Database Migration Script for Neon/Cloud PostgreSQL
 * This script creates the database schema using the DB_URL connection
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Configure database connection for Neon
const dbConfig = process.env.DB_URL 
  ? { 
      connectionString: process.env.DB_URL,
      ssl: { rejectUnauthorized: false },
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

async function runMigration() {
  console.log('🚀 Starting database migration for Neon PostgreSQL...\n');
  
  try {
    // Read the schema file
    const schemaPath = path.join(__dirname, 'database_schema.sql');
    
    if (!fs.existsSync(schemaPath)) {
      throw new Error('database_schema.sql file not found');
    }
    
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('1. Connecting to database...');
    const client = await pool.connect();
    
    // Test connection
    const versionResult = await client.query('SELECT version()');
    console.log(`✅ Connected to: ${versionResult.rows[0].version.split(' ')[0]} ${versionResult.rows[0].version.split(' ')[1]}`);
    
    // Get current database name
    const dbResult = await client.query('SELECT current_database()');
    console.log(`✅ Database: ${dbResult.rows[0].current_database}`);
    
    console.log('\n2. Running migration...');
    
    // Clean and prepare SQL statements
    const cleanedSQL = schemaSQL
      .replace(/--.*$/gm, '') // Remove SQL comments
      .replace(/\/\*[\s\S]*?\*\//g, '') // Remove block comments
      .replace(/\n/g, ' ') // Replace newlines with spaces
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
    
    // Split SQL statements and execute them one by one
    const statements = cleanedSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      if (statement.toLowerCase().includes('create table')) {
        const tableName = statement.match(/create table (\w+)/i)?.[1];
        console.log(`   📝 Creating table: ${tableName}`);
      } else if (statement.toLowerCase().includes('create index')) {
        const indexName = statement.match(/create index (\w+)/i)?.[1];
        console.log(`   🗂️  Creating index: ${indexName}`);
      } else if (statement.toLowerCase().includes('constraint')) {
        console.log(`   🔗 Adding constraint...`);
      }
      
      try {
        await client.query(statement);
      } catch (error) {
        if (error.code === '42P07') {
          // Table already exists, skip
          console.log(`   ⚠️  Object already exists, skipping...`);
        } else {
          throw error;
        }
      }
    }
    
    console.log('✅ Migration completed successfully!\n');
    
    // Verify tables were created
    console.log('3. Verifying migration...');
    const tablesResult = await client.query(`
      SELECT table_name, 
             (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
      FROM information_schema.tables t
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);
    
    console.log('✅ Tables created:');
    tablesResult.rows.forEach(row => {
      console.log(`   📊 ${row.table_name} (${row.column_count} columns)`);
    });
    
    // Verify indexes
    const indexResult = await client.query(`
      SELECT indexname, tablename 
      FROM pg_indexes 
      WHERE schemaname = 'public' 
      AND indexname NOT LIKE '%_pkey'
      ORDER BY tablename, indexname
    `);
    
    if (indexResult.rows.length > 0) {
      console.log('\n✅ Indexes created:');
      indexResult.rows.forEach(row => {
        console.log(`   🗂️  ${row.indexname} on ${row.tablename}`);
      });
    }
    
    client.release();
    
    console.log('\n🎉 Database migration completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Test the connection: npm run test-db');
    console.log('2. Start the server: npm start');
    console.log('3. Test the API: curl http://localhost:3000/health\n');
    
  } catch (error) {
    console.error('\n❌ Migration failed:');
    console.error(`Error: ${error.message}`);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 Connection refused. Check your DB_URL in .env file');
    } else if (error.code === '42P07') {
      console.error('\n💡 Table already exists. This might be a partial migration.');
      console.error('You can drop tables manually and re-run if needed.');
    } else if (error.code === '28P01') {
      console.error('\n💡 Authentication failed. Check your database credentials.');
    }
    
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Handle script termination
process.on('SIGINT', async () => {
  console.log('\n\n🛑 Migration interrupted');
  await pool.end();
  process.exit(0);
});

// Run the migration
runMigration();
