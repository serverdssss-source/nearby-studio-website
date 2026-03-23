import pg from 'pg';

const { Pool } = pg;

// Singleton pool — reused across warm serverless invocations
let pool;

export function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.NEON_DB_URL,
      ssl: { rejectUnauthorized: false },
    });
  }
  return pool;
}

/**
 * Ensure the bookings table exists (idempotent).
 */
export async function initDb() {
  const db = getPool();
  await db.query(`
    CREATE TABLE IF NOT EXISTS bookings (
      id SERIAL PRIMARY KEY,
      booking_id VARCHAR(50) UNIQUE NOT NULL,
      package_id VARCHAR(50) NOT NULL,
      package_name VARCHAR(100) NOT NULL,
      booking_date DATE NOT NULL,
      start_time VARCHAR(20) NOT NULL,
      end_time VARCHAR(20) NOT NULL,
      client_name VARCHAR(100) NOT NULL,
      client_email VARCHAR(100) NOT NULL,
      client_phone VARCHAR(50) NOT NULL,
      client_company VARCHAR(100),
      client_gst VARCHAR(50),
      client_notes TEXT,
      amount INTEGER NOT NULL,
      status VARCHAR(20) DEFAULT 'Pending',
      payment_status VARCHAR(20) DEFAULT 'Unpaid',
      razorpay_order_id VARCHAR(100),
      razorpay_payment_id VARCHAR(100),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
}
