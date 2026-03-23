import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.NEON_DB_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function clearDB() {
  try {
    await pool.query('TRUNCATE TABLE bookings RESTART IDENTITY;');
    console.log('Bookings table cleared successfully.');
  } catch (err) {
    console.error('Error clearing bookings:', err);
  } finally {
    pool.end();
  }
}

clearDB();
