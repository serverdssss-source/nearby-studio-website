import Razorpay from 'razorpay';
import { getPool, initDb } from './lib/db.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await initDb();
    const { amount, bookingData } = req.body;

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const options = {
      amount: Math.round(amount * 100),
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    const bookingId = `SB${Date.now().toString(36).toUpperCase()}`;

    const pool = getPool();
    await pool.query(
      `INSERT INTO bookings(
        booking_id, package_id, package_name, booking_date, start_time, end_time,
        client_name, client_email, client_phone, client_company, client_gst, client_notes,
        amount, status, payment_status, razorpay_order_id
      ) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,'Pending','Unpaid',$14)`,
      [
        bookingId,
        bookingData.packageId,
        bookingData.packageName,
        bookingData.date,
        bookingData.startTime,
        bookingData.endTime,
        bookingData.clientDetails.name,
        bookingData.clientDetails.email,
        bookingData.clientDetails.phone,
        bookingData.clientDetails.company || '',
        bookingData.clientDetails.gst || '',
        bookingData.clientDetails.notes || '',
        amount,
        order.id,
      ]
    );

    return res.status(200).json({ order, bookingId });
  } catch (err) {
    console.error('orders error:', err);
    return res.status(500).json({ error: 'Failed to create order' });
  }
}
