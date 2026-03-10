import { getPool, initDb } from '../lib/db.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await initDb();
    const { password } = req.query;
    if (password !== 'nearby_admin_2026') {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const pool = getPool();
    const result = await pool.query('SELECT * FROM bookings ORDER BY created_at DESC');
    return res.status(200).json(result.rows);
  } catch (err) {
    console.error('admin/bookings error:', err);
    return res.status(500).json({ error: 'Failed to fetch admin bookings' });
  }
}
