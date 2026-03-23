import { useState } from 'react';
import { motion } from 'framer-motion';
import jsPDF from 'jspdf';
import Navbar from '../Navbar';
import SripadaInvoice from '../Invoice';
import './BookingFlow.css';

// Studio constants — used to populate the GST invoice
const STUDIO = {
  studioName: 'Nearby Studio',
  studioGSTNumber: '29ABRCS9041A1Z2',
  studioAddress: 'No:4/2, 1st Floor, Chord Rd, Rajaji Nagar Industrial Town, Rajajinagar, Bengaluru, Karnataka 560 010',
  studioPhone: '+91 9060870117',
  studioWebsite: 'www.nearbystudio.in',
  studioEmail: 'nearbystudiosocial@gmail.com',
  bankAccountHolder: 'Nearby Studio',
  bankAccountNumber: '50200098765432',
  bankName: 'HDFC Bank',
  ifscCode: 'HDFC0001234',
  upiId: 'nearbystudio@hdfcbank',
};

// Map a booking row → GSTInvoiceData for the Invoice template
function bookingToInvoice(b) {
  const bookingDate = b.booking_date ? b.booking_date.split('T')[0] : new Date().toISOString().split('T')[0];
  return {
    id: b.booking_id,
    invoiceNo: `INV-${b.booking_id}`,
    gstNumber: STUDIO.studioGSTNumber,
    sacHsn: '998311',
    clientId: b.booking_id,
    clientName: b.client_name,
    clientEmail: b.client_email,
    clientPhone: b.client_phone,
    clientGSTID: b.client_gst || '',
    clientAddress: b.client_company || '',
    serviceDescription: b.package_name,
    packageDescription: `${b.start_time} - ${b.end_time}`,
    servicePeriodFrom: bookingDate,
    servicePeriodTo: bookingDate,
    date: bookingDate,
    status: b.payment_status === 'Paid' ? 'paid' : 'draft',
    amount: Number(b.amount),
    cgstRate: 9,
    sgstRate: 9,
    taxRate: 0,
    tdsApplicable: false,
    ...STUDIO,
    services: [
      {
        serviceName: b.package_name,
        description: `${new Date(bookingDate).toLocaleDateString('en-IN')} | ${b.start_time} - ${b.end_time}`,
        amount: Number(b.amount),
      }
    ],
  };
}

// Simple receipt PDF (booking confirmation doc)
async function generateReceiptPDF(b) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const teal = [0, 194, 168];

  doc.setFillColor(...teal);
  doc.rect(0, 0, 210, 28, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18); doc.setFont('helvetica', 'bold');
  doc.text('Nearby Studio', 14, 12);
  doc.setFontSize(9); doc.setFont('helvetica', 'normal');
  doc.text('Booking Receipt', 14, 20);
  doc.text(`Booking ID: ${b.booking_id}`, 196, 12, { align: 'right' });
  doc.text(`Date: ${new Date().toLocaleDateString('en-IN')}`, 196, 20, { align: 'right' });

  const section = (title, y) => {
    doc.setFillColor(240, 253, 250); doc.rect(10, y, 190, 7, 'F');
    doc.setTextColor(...teal); doc.setFontSize(10); doc.setFont('helvetica', 'bold');
    doc.text(title, 14, y + 5); return y + 12;
  };
  const row = (label, value, y) => {
    doc.setTextColor(80, 80, 80); doc.setFontSize(9); doc.setFont('helvetica', 'bold');
    doc.text(label, 14, y);
    doc.setFont('helvetica', 'normal'); doc.setTextColor(30, 30, 30);
    doc.text(String(value || '-'), 59, y); return y + 7;
  };

  let y = 36;
  y = section('Client Information', y);
  y = row('Name:', b.client_name, y);
  y = row('Email:', b.client_email, y);
  y = row('Phone:', b.client_phone, y);
  if (b.client_company) y = row('Company:', b.client_company, y);
  if (b.client_gst) y = row('GST:', b.client_gst, y);
  y += 4;

  y = section('Booking Details', y);
  y = row('Package:', b.package_name, y);
  y = row('Date:', new Date(b.booking_date).toLocaleDateString('en-IN'), y);
  y = row('Time:', `${b.start_time} - ${b.end_time}`, y);
  if (b.client_notes) y = row('Notes:', b.client_notes, y);
  y += 4;

  y = section('Payment Information', y);
  y = row('Amount:', `INR ${Number(b.amount).toLocaleString('en-IN')}`, y);
  y = row('Status:', b.payment_status, y);
  if (b.razorpay_payment_id) y = row('Transaction ID:', b.razorpay_payment_id, y);
  y += 8;

  doc.setDrawColor(...teal); doc.setLineWidth(0.5); doc.line(10, y, 200, y); y += 6;
  doc.setTextColor(150, 150, 150); doc.setFontSize(8);
  doc.text('Thank you for choosing Nearby Studio! | help@nearby-studio.in | www.nearbystudio.in', 105, y, { align: 'center' });

  return doc.output('blob');
}

function ReceiptModal({ booking, onClose }) {
  const [pdfUrl, setPdfUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  useState(() => {
    generateReceiptPDF(booking).then(blob => {
      setPdfUrl(URL.createObjectURL(blob));
      setLoading(false);
    });
  });

  const handleDownload = async () => {
    const blob = await generateReceiptPDF(booking);
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `Receipt_${booking.booking_id}.pdf`;
    a.click();
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 1000, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '90%', maxWidth: '800px', background: '#1a1a1f', borderRadius: '12px', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <span style={{ color: '#00c2a8', fontWeight: '700' }}>Receipt — {booking.booking_id}</span>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button onClick={handleDownload} style={{ background: '#00c2a8', color: '#000', border: 'none', borderRadius: '6px', padding: '6px 14px', fontWeight: '700', cursor: 'pointer', fontSize: '0.8rem' }}>⬇ Download</button>
            <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', borderRadius: '6px', padding: '6px 14px', cursor: 'pointer', fontSize: '0.8rem' }}>✕ Close</button>
          </div>
        </div>
        <div style={{ height: '75vh' }}>
          {loading
            ? <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#00c2a8' }}>Generating PDF...</div>
            : <iframe src={pdfUrl} style={{ width: '100%', height: '100%', border: 'none' }} title="Booking Receipt" />
          }
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [bookings, setBookings] = useState([]);
  const [password, setPassword] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [receiptBooking, setReceiptBooking] = useState(null);
  const [invoiceBooking, setInvoiceBooking] = useState(null);
  const [resendStatus, setResendStatus] = useState({});
  const adminPassword = 'nearby_admin_2026';

  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${baseUrl}/api/admin/bookings?password=${password}`);
      if (response.ok) {
        const data = await response.json();
        setBookings(data);
        setIsAuthorized(true);
        setError('');
      } else {
        setError('Invalid password or unauthorized access.');
      }
    } catch {
      setError('Connection failed. Is the server running?');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async (bookingId) => {
    setResendStatus(s => ({ ...s, [bookingId]: 'sending' }));
    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await fetch(`${baseUrl}/api/admin/resend-invoice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: adminPassword, bookingId })
      });
      setResendStatus(s => ({ ...s, [bookingId]: res.ok ? 'sent' : 'error' }));
      setTimeout(() => setResendStatus(s => ({ ...s, [bookingId]: null })), 3000);
    } catch {
      setResendStatus(s => ({ ...s, [bookingId]: 'error' }));
      setTimeout(() => setResendStatus(s => ({ ...s, [bookingId]: null })), 3000);
    }
  };

  const handleLogin = (e) => { e.preventDefault(); fetchBookings(); };

  if (!isAuthorized) {
    return (
      <div className="booking-section" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Navbar />
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="summary-card" style={{ maxWidth: '400px', width: '90%' }}>
          <h2 style={{ marginBottom: '2rem', textAlign: 'center', color: '#00c2a8' }}>Admin Login</h2>
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="b-form-group">
              <label>Admin Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter secure key..." required />
            </div>
            {error && <p style={{ color: '#ff4444', fontSize: '0.8rem' }}>{error}</p>}
            <button type="submit" className="btn-next" style={{ width: '100%' }}>{isLoading ? 'Checking...' : 'ACCESS DASHBOARD'}</button>
          </form>
        </motion.div>
      </div>
    );
  }

  // Full-screen GST Invoice view
  if (invoiceBooking) {
    return (
      <SripadaInvoice
        invoice={bookingToInvoice(invoiceBooking)}
        onBack={() => setInvoiceBooking(null)}
        onSendEmail={() => {}}
      />
    );
  }

  return (
    <div className="booking-section" style={{ minHeight: '100vh', padding: '120px 2rem 5rem' }}>
      <Navbar />
      {receiptBooking && <ReceiptModal booking={receiptBooking} onClose={() => setReceiptBooking(null)} />}

      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '800' }}>
            Global <span style={{ color: '#00c2a8' }}>Bookings</span>
          </h1>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button onClick={fetchBookings} className="btn-next" style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem' }}>↻ Refresh</button>
            <button onClick={() => setIsAuthorized(false)} className="btn-back">LOGOUT</button>
          </div>
        </div>

        <div className="summary-card" style={{ padding: '0', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', color: 'white', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.05)', textAlign: 'left' }}>
                <th style={{ padding: '1.5rem' }}>ID</th>
                <th style={{ padding: '1.5rem' }}>Client</th>
                <th style={{ padding: '1.5rem' }}>Service</th>
                <th style={{ padding: '1.5rem' }}>Date/Time</th>
                <th style={{ padding: '1.5rem' }}>Amount</th>
                <th style={{ padding: '1.5rem' }}>Status</th>
                <th style={{ padding: '1.5rem' }}>Documents</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '1.25rem' }}>
                    <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem' }}>{b.booking_id}</span>
                  </td>
                  <td style={{ padding: '1.25rem' }}>
                    <div style={{ fontWeight: '600' }}>{b.client_name}</div>
                    <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem' }}>{b.client_email}</div>
                    <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem' }}>{b.client_phone}</div>
                  </td>
                  <td style={{ padding: '1.25rem' }}>
                    <div style={{ color: '#00c2a8' }}>{b.package_name}</div>
                  </td>
                  <td style={{ padding: '1.25rem' }}>
                    <div>{new Date(b.booking_date).toLocaleDateString('en-IN')}</div>
                    <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem' }}>{b.start_time} - {b.end_time}</div>
                  </td>
                  <td style={{ padding: '1.25rem' }}>₹{Number(b.amount).toLocaleString('en-IN')}</td>
                  <td style={{ padding: '1.25rem' }}>
                    <span style={{
                      background: b.payment_status === 'Paid' ? 'rgba(0,194,168,0.1)' : 'rgba(255,68,68,0.1)',
                      color: b.payment_status === 'Paid' ? '#00c2a8' : '#ff4444',
                      padding: '4px 10px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '700'
                    }}>
                      {b.payment_status === 'Paid' ? 'CONFIRMED' : 'UNPAID'}
                    </span>
                  </td>
                  <td style={{ padding: '1.25rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {/* Receipt PDF */}
                      <button
                        onClick={() => setReceiptBooking(b)}
                        style={{ background: 'rgba(0,194,168,0.15)', color: '#00c2a8', border: '1px solid rgba(0,194,168,0.3)', borderRadius: '6px', padding: '5px 12px', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer', whiteSpace: 'nowrap' }}
                      >
                        📄 Receipt
                      </button>
                      {/* GST Invoice */}
                      <button
                        onClick={() => setInvoiceBooking(b)}
                        style={{ background: 'rgba(100,150,255,0.15)', color: '#7eb3ff', border: '1px solid rgba(100,150,255,0.3)', borderRadius: '6px', padding: '5px 12px', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer', whiteSpace: 'nowrap' }}
                      >
                        🧾 Invoice
                      </button>
                      {/* Resend email */}
                      {b.payment_status === 'Paid' && (
                        <button
                          onClick={() => handleResend(b.booking_id)}
                          disabled={resendStatus[b.booking_id] === 'sending'}
                          style={{
                            background: resendStatus[b.booking_id] === 'sent' ? 'rgba(0,200,100,0.15)' : resendStatus[b.booking_id] === 'error' ? 'rgba(255,68,68,0.15)' : 'rgba(255,255,255,0.05)',
                            color: resendStatus[b.booking_id] === 'sent' ? '#00c864' : resendStatus[b.booking_id] === 'error' ? '#ff4444' : 'rgba(255,255,255,0.7)',
                            border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', padding: '5px 12px', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer', whiteSpace: 'nowrap'
                          }}
                        >
                          {resendStatus[b.booking_id] === 'sending' ? '⏳ Sending...' : resendStatus[b.booking_id] === 'sent' ? '✓ Sent!' : resendStatus[b.booking_id] === 'error' ? '✗ Failed' : '✉ Resend'}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {bookings.length === 0 && (
            <div style={{ padding: '4rem', textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>No bookings found.</div>
          )}
        </div>
      </div>
    </div>
  );
}
