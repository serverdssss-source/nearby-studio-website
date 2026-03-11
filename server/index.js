import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import pg from 'pg';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import { Resend } from 'resend';
import { sendConfirmationEmail, sendAdminNotification } from './utils/mailer.js';

const { Pool } = pg;
const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

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
        package_description TEXT,
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
    // For pending bookings, only consider them if they were created in the last 10 minutes
    const result = await pool.query(
      `SELECT start_time, end_time FROM bookings 
       WHERE booking_date = $1 
       AND (status = 'Confirmed' OR (status = 'Pending' AND created_at > NOW() - INTERVAL '10 minutes'))`,
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
    console.log("Razorpay Order Created:", order.id);

    const countResult = await pool.query('SELECT COUNT(*) FROM bookings');
    const orderNumber = parseInt(countResult.rows[0].count) + 1;
    const bookingId = `SS-NBS${orderNumber.toString().padStart(2, '0')}`;

    // Save as Pending Booking in DB to hold the slot temporarily
    await pool.query(`
      INSERT INTO bookings(
      booking_id, package_id, package_name, booking_date, start_time, end_time, package_description,
      client_name, client_email, client_phone, client_company, client_gst, client_notes,
      amount, status, payment_status, razorpay_order_id
    ) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, 'Pending', 'Unpaid', $15)
      `, [
      bookingId,
      bookingData.packageId,
      bookingData.packageName,
      bookingData.date, // Format: 2026-03-15
      bookingData.startTime,
      bookingData.endTime,
      bookingData.packageDescription || '',
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
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const bookingId = req.body.bookingId || req.query.bookingId;
    
    console.log("Verification Request received for Booking:", bookingId);
    console.log("Payload:", { razorpay_order_id, razorpay_payment_id });

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !bookingId) {
       console.error("Missing verification data:", { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId });
       return res.status(400).send("Invalid verification data");
    }

    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest("hex");

    console.log("Signature Check:", { received: razorpay_signature, expected: expectedSign });

    if (razorpay_signature === expectedSign) {
      // Payment is verified
      const result = await pool.query(`
        UPDATE bookings 
        SET status = 'Confirmed', payment_status = 'Paid', razorpay_payment_id = $1
        WHERE booking_id = $2
        RETURNING *
      `, [razorpay_payment_id, bookingId]);

      if (result.rows.length === 0) {
        console.error("Booking not found in DB during verification:", bookingId);
        return res.status(404).json({ error: "Booking not found" });
      }

      const confirmedBooking = result.rows[0];

      // Send confirmation email to client
      sendConfirmationEmail(confirmedBooking).catch(err => console.error('Delayed Email Error:', err));

      console.log("Payment Verified Successfully in DB for Booking:", bookingId);

      // Handle Redirect vs JSON response
      if (req.headers['accept'] && req.headers['accept'].includes('text/html')) {
        // This was likely a Razorpay redirect
        return res.redirect(`https://nearbystudio.in/book?confirmed=true&id=${bookingId}`);
      }
      
      return res.status(200).json({ message: "Payment verified successfully", booking: confirmedBooking });
    } else {
      console.error("Signature mismatch for booking:", bookingId);
      return res.status(400).json({ error: "Invalid signature" });
    }
  } catch (err) {
    console.error("Verification endpoint error:", err);
    res.status(500).json({ error: 'Verification failed internal error' });
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

// Route: Send Invoice PDF via Resend
const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy_key');

app.post('/api/send-invoice', async (req, res) => {
  try {
    const { invoiceNo, clientEmail, clientName, invoice, pdfBase64 } = req.body;

    if (!clientEmail || !pdfBase64) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Collect all CC emails including admin
    const adminEmail = process.env.ADMIN_EMAIL || 'nearbystudiosocial@gmail.com';
    const ccEmails = new Set();
    ccEmails.add(adminEmail);

    if (invoice.ccEmail1) ccEmails.add(invoice.ccEmail1);
    if (invoice.ccEmail2) ccEmails.add(invoice.ccEmail2);
    if (invoice.ccEmails && Array.isArray(invoice.ccEmails)) {
      invoice.ccEmails.forEach(e => {
        if (e && e.trim()) ccEmails.add(e.trim());
      });
    }

    // Convert base64 PDF to buffer
    const pdfBuffer = Buffer.from(pdfBase64, 'base64');

    const emailResponse = await resend.emails.send({
      from: 'Nearby Studio <contact@nearbystudio.in>', 
      reply_to: 'nearbystudiosocial@gmail.com',
      to: [clientEmail],
      cc: Array.from(ccEmails),
      subject: `Invoice ${invoiceNo} from Nearby Studio`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #2f7c7c;">Your Invoice from Nearby Studio</h2>
          <p>Hi <strong>${clientName}</strong>,</p>
          <p>Thank you for choosing Nearby Studio. Please find your invoice <strong>#${invoiceNo}</strong> attached to this email.</p>
          <p>Total Amount: <strong>INR ${invoice.amount.toLocaleString('en-IN')}</strong></p>
          <p>If you have any questions, feel free to reply to this email.</p>
          <br>
          <p>Best regards,<br>The Nearby Studio Team</p>
        </div>
      `,
      attachments: [
        {
          filename: `Invoice_${invoiceNo}.pdf`,
          content: pdfBuffer,
        },
      ],
    });

    if (emailResponse.error) {
      console.error('Resend API Error:', emailResponse.error);
      return res.status(500).json({ error: 'Failed to send invoice via Resend', details: emailResponse.error });
    }

    res.status(200).json({ success: true, message: 'Invoice sent successfully', id: emailResponse.data?.id });
  } catch (error) {
    console.error('Error in send-invoice route:', error);
    res.status(500).json({ error: 'Internal server error while sending invoice' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));

