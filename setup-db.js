import { Client } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const DB_USER = 'USER';
const DB_PASSWORD = 'kusayadi17';
const DB_NAME = 'JobApplicationDB';
const DB_HOST = 'localhost';
const DB_PORT = 5432;

async function setupDatabase() {
  // Connect to postgres database to create user and database
  const adminClient = new Client({
    user: process.env.DB_ADMIN_USER || 'postgres',
    password: process.env.DB_ADMIN_PASSWORD || 'postgres',
    host: DB_HOST,
    port: DB_PORT,
    database: 'postgres', // Connect to default postgres database first
  });

  try {
    console.log('Connecting to PostgreSQL...');
    await adminClient.connect();
    console.log('✓ Connected to PostgreSQL');

    // Create user if it doesn't exist
    try {
      await adminClient.query(`CREATE USER "${DB_USER}" WITH PASSWORD '${DB_PASSWORD}';`);
      console.log(`✓ Created user "${DB_USER}"`);
    } catch (err) {
      if (err.message.includes('already exists')) {
        console.log(`✓ User "${DB_USER}" already exists`);
      } else {
        throw err;
      }
    }

    // Create database if it doesn't exist
    try {
      await adminClient.query(`CREATE DATABASE "${DB_NAME}" OWNER "${DB_USER}";`);
      console.log(`✓ Created database "${DB_NAME}"`);
    } catch (err) {
      if (err.message.includes('already exists')) {
        console.log(`✓ Database "${DB_NAME}" already exists`);
      } else {
        throw err;
      }
    }

    // Grant permissions
    await adminClient.query(`GRANT ALL PRIVILEGES ON DATABASE "${DB_NAME}" TO "${DB_USER}";`);
    console.log(`✓ Granted privileges to "${DB_USER}"`);

    await adminClient.end();
    console.log('\n✓ Database setup completed successfully!\n');
  } catch (error) {
    console.error('✗ Database setup failed:', error.message);
    console.error('\nPlease ensure:');
    console.error('1. PostgreSQL is running on localhost:5432');
    console.error('2. Default postgres user has password "postgres" or set DB_ADMIN_USER and DB_ADMIN_PASSWORD env vars');
    process.exit(1);
  }
}

setupDatabase();
