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
        const res = await pool.query("SELECT booking_id, razorpay_payment_id, status, payment_status, created_at FROM bookings WHERE razorpay_payment_id = 'pay_SP6VJowX951UYd' OR razorpay_payment_id IS NULL ORDER BY created_at DESC LIMIT 5");
        console.log('Payment Check:');
        console.table(res.rows);
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}
check();
