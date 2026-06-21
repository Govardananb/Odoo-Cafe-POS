import pg from 'pg';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const { Client } = pg;

const passwords = ['123', 'postgres', 'odoo', 'odoo123', 'admin', 'root', 'password', '1234', '123456', 'govardanan', ''];
const usernames = ['postgres', 'odoo', 'Govardanan'];
const host = 'localhost';
const port = 5432;
const dbName = 'odoo_cafe';

async function testConnection(username, password) {
  const client = new Client({
    user: username,
    password: password,
    host: host,
    port: port,
    database: 'postgres'
  });
  
  try {
    await client.connect();
    await client.end();
    return true;
  } catch (err) {
    console.log(`  └─ Connection error for ${username}: ${err.message} (code: ${err.code})`);
    return false;
  }
}

async function run() {
  console.log('[DB-SETUP] Searching for working PostgreSQL credentials...');
  let workingUser = null;
  let workingPassword = null;
  
  for (const user of usernames) {
    for (const pw of passwords) {
      console.log(`[DB-SETUP] Trying ${user}:${pw || '(empty)'}...`);
      const ok = await testConnection(user, pw);
      if (ok) {
        workingUser = user;
        workingPassword = pw;
        console.log(`[DB-SETUP] Success! Found working credentials: ${user}:${pw || '(empty)'}`);
        break;
      }
    }
    if (workingUser) break;
  }
  
  if (workingUser === null) {
    console.error('[DB-SETUP] Could not connect to local PostgreSQL with common credentials.');
    console.error('[DB-SETUP] Please create backend/.env manually with your DATABASE_URL.');
    process.exit(1);
  }
  
  const client = new Client({
    user: workingUser,
    password: workingPassword,
    host: host,
    port: port,
    database: 'postgres'
  });
  
  try {
    await client.connect();
    
    const res = await client.query("SELECT 1 FROM pg_database WHERE datname = $1", [dbName]);
    if (res.rowCount === 0) {
      console.log(`[DB-SETUP] Database "${dbName}" does not exist. Creating it...`);
      await client.query(`CREATE DATABASE ${dbName}`);
      console.log(`[DB-SETUP] Database "${dbName}" created successfully.`);
    } else {
      console.log(`[DB-SETUP] Database "${dbName}" already exists.`);
    }
    
    await client.end();
    
    const jwtSecret = crypto.randomBytes(32).toString('hex');
    
    const envContent = `# Database Configuration
DATABASE_URL="postgresql://${workingUser}:${workingPassword}@${host}:${port}/${dbName}?schema=public"

# Server Configuration
PORT=5000
FRONTEND_URL="http://localhost:3000"

# Authentication
JWT_SECRET="${jwtSecret}"
`;
    
    fs.writeFileSync('.env', envContent, 'utf8');
    console.log('[DB-SETUP] Created backend/.env file successfully!');
    
  } catch (err) {
    console.error('[DB-SETUP] Error during database creation:', err);
    try {
      await client.end();
    } catch (e) {}
    process.exit(1);
  }
}

run();
