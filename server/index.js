import express from 'express';
import cors from 'cors';
import pg from 'pg';
import dotenv from 'dotenv';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import { sendConfirmationEmail, sendAdminNotification } from './utils/mailer.js';

dotenv.config();

const { Pool } = pg;
const app = express();
app.use(cors());
app.use(express.json());

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'dummy_key',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy_secret',
});

// Database Connection (Neon DB / PostgreSQL)
const pool = new Pool({
  connectionString: process.env.NEON_DB_URL || 'postgresql://user:password@localhost:5432/db',
  ssl: {
    rejectUnauthorized: false
  }
});

// Create table if it doesn't exist
const initDb = async () => {
  try {
    await pool.query(`
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
    console.log('Neon PostgreSQL connected and configured.');
  } catch (err) {
    console.error('Neon DB Connection Error:', err);
  }
};
initDb();

// Route: Get Available Time Slots for a Date
app.get('/api/availability', async (req, res) => {
  try {
    const { date, packageDuration } = req.query; // date: 2026-03-15
    if (!date) return res.status(400).json({ error: 'Date is required' });

    // Find all confirmed or pending bookings for this date (ignoring cancelled ones)
    const result = await pool.query(
      `SELECT start_time, end_time FROM bookings 
       WHERE booking_date = $1 AND status IN ('Confirmed', 'Pending')`,
      [date]
    );

    // Format expected by frontend: { startTime: '10:00 AM', endTime: '12:00 PM' }
    const bookedTimeSlots = result.rows.map(row => ({
      startTime: row.start_time,
      endTime: row.end_time
    }));

    res.json({ bookedSlots: bookedTimeSlots });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error fetching availability' });
  }
});

// Route: Create Razorpay Order
app.post('/api/orders', async (req, res) => {
  try {
    const { amount, bookingData } = req.body;

    // Create Razorpay Order
    const options = {
      amount: Math.round(amount * 100), // convert to paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`
    };

    const order = await razorpay.orders.create(options);
    const bookingId = `SB${Date.now().toString(36).toUpperCase()}`;

    // Save as Pending Booking in DB to hold the slot temporarily
    await pool.query(`
      INSERT INTO bookings(
      booking_id, package_id, package_name, booking_date, start_time, end_time,
      client_name, client_email, client_phone, client_company, client_gst, client_notes,
      amount, status, payment_status, razorpay_order_id
    ) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, 'Pending', 'Unpaid', $14)
      `, [
      bookingId,
      bookingData.packageId,
      bookingData.packageName,
      bookingData.date, // Format: 2026-03-15
      bookingData.startTime,
      bookingData.endTime,
      bookingData.clientDetails.name,
      bookingData.clientDetails.email,
      bookingData.clientDetails.phone,
      bookingData.clientDetails.company || '',
      bookingData.clientDetails.gst || '',
      bookingData.clientDetails.notes || '',
      amount,
      order.id
    ]);

    res.json({ order, bookingId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// Route: Verify Payment Signature and Confirm Booking
app.post('/api/verify', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId } = req.body;

    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature === expectedSign) {
      // Payment is verified
      const result = await pool.query(`
        UPDATE bookings 
        SET status = 'Confirmed', payment_status = 'Paid', razorpay_payment_id = $1
        WHERE booking_id = $2
    RETURNING *
      `, [razorpay_payment_id, bookingId]);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Booking not found" });
      }

      const confirmedBooking = result.rows[0];

      // Send confirmation email to client
      // We don't await to avoid blocking the response
      sendConfirmationEmail(confirmedBooking).catch(err => console.error('Delayed Email Error:', err));

      // Send alert to admin
      sendAdminNotification(confirmedBooking).catch(err => console.error('Delayed Admin Alert:', err));

      res.status(200).json({ message: "Payment verified successfully", booking: result.rows[0] });
    } else {
      res.status(400).json({ error: "Invalid payment signature!" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to verify payment' });
  }
});

// Route: Admin - Get All Bookings
app.get('/api/admin/bookings', async (req, res) => {
  try {
    const { password } = req.query;
    if (password !== 'nearby_admin_2026') {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const result = await pool.query('SELECT * FROM bookings ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch admin bookings' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT} `));

