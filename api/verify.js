import crypto from 'crypto';
import { getPool } from './lib/db.js';
import { sendConfirmationEmail, sendAdminNotification } from './lib/mailer.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId } = req.body;

    const sign = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(sign)
      .digest('hex');

    if (razorpay_signature !== expectedSign) {
      return res.status(400).json({ error: 'Invalid payment signature!' });
    }

    const pool = getPool();
    const result = await pool.query(
      `UPDATE bookings
       SET status = 'Confirmed', payment_status = 'Paid', razorpay_payment_id = $1
       WHERE booking_id = $2
       RETURNING *`,
      [razorpay_payment_id, bookingId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const confirmedBooking = result.rows[0];

    // Send emails in background (don't block the response)
    sendConfirmationEmail(confirmedBooking).catch(err =>
      console.error('Confirmation email error:', err)
    );
    sendAdminNotification(confirmedBooking).catch(err =>
      console.error('Admin notification error:', err)
    );

    return res.status(200).json({
      message: 'Payment verified successfully',
      booking: confirmedBooking,
    });
  } catch (err) {
    console.error('verify error:', err);
    return res.status(500).json({ error: 'Failed to verify payment' });
  }
}
