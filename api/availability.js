import { getPool, initDb } from './lib/db.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await initDb();
    const { date, packageDuration } = req.query;
    if (!date) return res.status(400).json({ error: 'Date is required' });

    const pool = getPool();
    const result = await pool.query(
      `SELECT start_time, end_time FROM bookings
       WHERE booking_date = $1 AND status IN ('Confirmed', 'Pending')`,
      [date]
    );

    const bookedSlots = result.rows.map(row => ({
      startTime: row.start_time,
      endTime: row.end_time,
    }));

    return res.status(200).json({ bookedSlots });
  } catch (err) {
    console.error('availability error:', err);
    return res.status(500).json({ error: 'Server error fetching availability' });
  }
}
