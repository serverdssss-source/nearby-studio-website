import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pg;
const pool = new Pool({
    connectionString: process.env.NEON_DB_URL,
    ssl: { rejectUnauthorized: false }
});

async function check() {
    try {
        const res = await pool.query("SELECT booking_id, razorpay_payment_id, status, payment_status, created_at FROM bookings ORDER BY created_at DESC LIMIT 5");
        console.log(JSON.stringify(res.rows, null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}
check();
