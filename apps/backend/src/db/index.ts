import { execSync } from "child_process";
import { Client } from "pg";

const pgConfig = {
  user: process.env.PG_USER || 'postgres',
  password: process.env.PG_PASSWORD || 'admin',
  host: process.env.PG_HOST || 'localhost',
  port: Number(process.env.PG_PORT) || 5432,
  database: 'postgres', 
};


const targetDb = process.env.DB_NAME || 'wokilitedb';


export async function ensureDatabaseExists() {
  const client = new Client(pgConfig);
  try {
    await client.connect();
    const res = await client.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [targetDb]
    );

    if (res.rowCount === 0) {
      console.log(`🟢 Creating database '${targetDb}'...`);
      await client.query(`CREATE DATABASE ${targetDb}`);
      execSync('npx prisma migrate deploy', { stdio: 'inherit' });
      console.log(`✅ Database '${targetDb}' created successfully.`);
    } else {
      console.log(`✅ Database '${targetDb}' already exists.`);
    }
  } catch (err) {
    console.error('❌ Error checking/creating database:', err);
    process.exit(1);
  } finally {
    await client.end();
  }
}