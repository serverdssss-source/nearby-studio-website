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

// ── Calendar Component ──────────────────────────────────────────────────
function CalendarTab({ bookings, onViewReceipt }) {
  const today = new Date();
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth()); // 0-indexed
  const [selectedDay, setSelectedDay] = useState(null); // Date string 'YYYY-MM-DD'

  const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const dayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

  // Build a map: { 'YYYY-MM-DD': [booking, ...] }
  const bookingMap = {};
  bookings.forEach(b => {
    const dateKey = b.booking_date ? b.booking_date.split('T')[0] : null;
    if (!dateKey) return;
    if (!bookingMap[dateKey]) bookingMap[dateKey] = [];
    bookingMap[dateKey].push(b);
  });

  // Days in month
  const firstDay = new Date(calYear, calMonth, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();

  const prevMonth = () => {
    if (calMonth === 0) { setCalYear(y => y - 1); setCalMonth(11); }
    else setCalMonth(m => m - 1);
    setSelectedDay(null);
  };
  const nextMonth = () => {
    if (calMonth === 11) { setCalYear(y => y + 1); setCalMonth(0); }
    else setCalMonth(m => m + 1);
    setSelectedDay(null);
  };

  const pad = n => String(n).padStart(2, '0');
  const todayStr = `${today.getFullYear()}-${pad(today.getMonth()+1)}-${pad(today.getDate())}`;

  const selectedBookings = selectedDay ? (bookingMap[selectedDay] || []) : [];

  return (
    <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
      {/* Calendar Grid */}
      <div className="summary-card" style={{ flex: '1', minWidth: '340px', padding: '1.5rem' }}>
        {/* Month Nav */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <button onClick={prevMonth} style={{ background: 'rgba(255,255,255,0.08)', border: 'none', color: 'white', borderRadius: '8px', padding: '6px 14px', cursor: 'pointer', fontSize: '1.1rem' }}>‹</button>
          <span style={{ fontWeight: '800', fontSize: '1.2rem', color: '#00c2a8' }}>{monthNames[calMonth]} {calYear}</span>
          <button onClick={nextMonth} style={{ background: 'rgba(255,255,255,0.08)', border: 'none', color: 'white', borderRadius: '8px', padding: '6px 14px', cursor: 'pointer', fontSize: '1.1rem' }}>›</button>
        </div>

        {/* Day Headers */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '4px' }}>
          {dayNames.map(d => (
            <div key={d} style={{ textAlign: 'center', fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)', fontWeight: '700', padding: '4px 0' }}>{d}</div>
          ))}
        </div>

        {/* Day Cells */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
          {/* Empty cells before first day */}
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
          {/* Day cells */}
          {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
            const dateKey = `${calYear}-${pad(calMonth+1)}-${pad(day)}`;
            const dayBookings = bookingMap[dateKey] || [];
            const count = dayBookings.length;
            const isToday = dateKey === todayStr;
            const isSelected = dateKey === selectedDay;
            const hasBookings = count > 0;

            return (
              <div
                key={day}
                onClick={() => setSelectedDay(isSelected ? null : dateKey)}
                style={{
                  borderRadius: '10px',
                  padding: '8px 4px 6px',
                  textAlign: 'center',
                  cursor: hasBookings ? 'pointer' : 'default',
                  background: isSelected
                    ? 'rgba(0,194,168,0.25)'
                    : isToday
                      ? 'rgba(0,194,168,0.1)'
                      : hasBookings
                        ? 'rgba(255,255,255,0.05)'
                        : 'transparent',
                  border: isSelected
                    ? '1.5px solid #00c2a8'
                    : isToday
                      ? '1.5px solid rgba(0,194,168,0.4)'
                      : '1.5px solid transparent',
                  transition: 'all 0.15s',
                  minHeight: '52px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                  gap: '4px',
                }}
              >
                <span style={{ fontSize: '0.8rem', fontWeight: isToday ? '800' : '500', color: isSelected ? '#00c2a8' : isToday ? '#00c2a8' : hasBookings ? 'white' : 'rgba(255,255,255,0.35)' }}>
                  {day}
                </span>
                {hasBookings && (
                  <span style={{
                    background: isSelected ? '#00c2a8' : 'rgba(0,194,168,0.7)',
                    color: isSelected ? '#000' : 'white',
                    borderRadius: '20px',
                    fontSize: '0.65rem',
                    fontWeight: '800',
                    padding: '1px 7px',
                    lineHeight: '1.6',
                  }}>
                    {count}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><span style={{ width: 10, height: 10, borderRadius: '50%', background: 'rgba(0,194,168,0.7)', display: 'inline-block' }} /> Has bookings</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><span style={{ width: 10, height: 10, borderRadius: '3px', border: '1.5px solid rgba(0,194,168,0.4)', display: 'inline-block' }} /> Today</span>
        </div>

        {/* Download Excel Button */}
        {(() => {
          // Collect bookings for this month
          const monthBookings = bookings.filter(b => {
            const d = b.booking_date ? b.booking_date.split('T')[0] : '';
            return d.startsWith(`${calYear}-${pad(calMonth + 1)}`);
          });
          const totalAmt = monthBookings.reduce((s, b) => s + Number(b.amount || 0), 0);

          const downloadCSV = () => {
            const headers = ['Booking ID','Client Name','Email','Phone','Company','Package','Date','Start Time','End Time','Amount (₹)','Payment Status','Booking Status','Notes'];
            const rows = monthBookings
              .slice()
              .sort((a, b) => {
                const da = a.booking_date || ''; const db = b.booking_date || '';
                return da < db ? -1 : da > db ? 1 : 0;
              })
              .map(b => {
                const dateStr = b.booking_date ? new Date(b.booking_date + 'T12:00:00').toLocaleDateString('en-IN') : '';
                return [
                  b.booking_id,
                  b.client_name,
                  b.client_email,
                  b.client_phone,
                  b.client_company || '',
                  b.package_name,
                  dateStr,
                  b.start_time,
                  b.end_time,
                  Number(b.amount || 0),
                  b.payment_status,
                  b.status,
                  (b.client_notes || '').replace(/,/g, ';'),
                ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(',');
              });

            // Summary footer rows
            rows.push('');
            rows.push(`"Total Bookings","${monthBookings.length}"`);
            rows.push(`"Total Amount","₹${totalAmt.toLocaleString('en-IN')}"`);
            rows.push(`"Paid","${monthBookings.filter(b => b.payment_status === 'Paid').length}"`);
            rows.push(`"Free","${monthBookings.filter(b => b.payment_status === 'Free').length}"`);
            rows.push(`"Unpaid","${monthBookings.filter(b => b.payment_status === 'Unpaid').length}"`);

            const csv = [headers.map(h => `"${h}"`).join(','), ...rows].join('\n');
            const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `NearbyStudio_Bookings_${monthNames[calMonth]}_${calYear}.csv`;
            a.click();
            URL.revokeObjectURL(url);
          };

          return (
            <div style={{ marginTop: '1.25rem', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginBottom: '2px' }}>{monthNames[calMonth]} {calYear}</div>
                  <div style={{ fontWeight: '700', fontSize: '0.92rem' }}>
                    {monthBookings.length} booking{monthBookings.length !== 1 ? 's' : ''}
                    <span style={{ color: '#00c2a8', marginLeft: '0.6rem' }}>₹{totalAmt.toLocaleString('en-IN')}</span>
                  </div>
                </div>
                <button
                  onClick={downloadCSV}
                  disabled={monthBookings.length === 0}
                  style={{
                    background: monthBookings.length === 0 ? 'rgba(255,255,255,0.04)' : 'rgba(0,194,168,0.15)',
                    color: monthBookings.length === 0 ? 'rgba(255,255,255,0.2)' : '#00c2a8',
                    border: `1.5px solid ${monthBookings.length === 0 ? 'rgba(255,255,255,0.08)' : 'rgba(0,194,168,0.4)'}`,
                    borderRadius: '8px',
                    padding: '0.5rem 1.1rem',
                    fontWeight: '700',
                    fontSize: '0.82rem',
                    cursor: monthBookings.length === 0 ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  ⬇ Download Excel
                </button>
              </div>
            </div>
          );
        })()}
      </div>

      {/* Day Detail Panel */}
      <div style={{ flex: '1', minWidth: '300px' }}>
        {!selectedDay ? (
          <div className="summary-card" style={{ padding: '2.5rem', textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📅</div>
            <div style={{ fontSize: '0.9rem' }}>Click on a day with bookings to see details</div>
          </div>
        ) : (
          <div className="summary-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ color: '#00c2a8', marginBottom: '1.25rem', fontWeight: '700', fontSize: '1.1rem' }}>
              {new Date(selectedDay + 'T12:00:00').toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              <span style={{ marginLeft: '0.75rem', color: 'rgba(255,255,255,0.4)', fontWeight: '500', fontSize: '0.85rem' }}>
                {selectedBookings.length} booking{selectedBookings.length !== 1 ? 's' : ''}
              </span>
            </h3>
            {selectedBookings.length === 0 ? (
              <div style={{ color: 'rgba(255,255,255,0.35)', textAlign: 'center', padding: '2rem 0', fontSize: '0.9rem' }}>No bookings on this day</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {selectedBookings
                  .slice()
                  .sort((a, b) => {
                    const toMins = t => {
                      if (!t || t === 'N/A') return 0;
                      const [time, period] = t.split(' ');
                      let [h, m] = time.split(':').map(Number);
                      if (period === 'PM' && h !== 12) h += 12;
                      if (period === 'AM' && h === 12) h = 0;
                      return h * 60 + m;
                    };
                    return toMins(a.start_time) - toMins(b.start_time);
                  })
                  .map(b => (
                    <div key={b.booking_id} style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '10px',
                      padding: '1rem 1.25rem',
                    }}>
                      {/* Time badge + client */}
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <div>
                          <div style={{ color: '#00c2a8', fontWeight: '800', fontSize: '0.95rem' }}>
                            {b.start_time} – {b.end_time}
                          </div>
                          <div style={{ fontWeight: '600', marginTop: '2px' }}>{b.client_name}</div>
                          <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.78rem' }}>{b.client_email}</div>
                        </div>
                        <span style={{
                          background: b.payment_status === 'Paid' ? 'rgba(0,194,168,0.12)' : b.payment_status === 'Free' ? 'rgba(100,180,255,0.12)' : 'rgba(255,68,68,0.1)',
                          color: b.payment_status === 'Paid' ? '#00c2a8' : b.payment_status === 'Free' ? '#7eb3ff' : '#ff4444',
                          padding: '3px 9px', borderRadius: '4px', fontSize: '0.68rem', fontWeight: '800',
                          whiteSpace: 'nowrap',
                        }}>
                          {b.payment_status === 'Paid' ? '✓ PAID' : b.payment_status === 'Free' ? '★ FREE' : 'UNPAID'}
                        </span>
                      </div>

                      {/* Package + amount */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.5rem' }}>
                        <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem' }}>{b.package_name}</span>
                        <span style={{ fontWeight: '700', fontSize: '0.85rem' }}>₹{Number(b.amount).toLocaleString('en-IN')}</span>
                      </div>

                      {/* Receipt button */}
                      <div style={{ marginTop: '0.75rem' }}>
                        <button
                          onClick={() => onViewReceipt(b)}
                          style={{ background: 'rgba(0,194,168,0.15)', color: '#00c2a8', border: '1px solid rgba(0,194,168,0.3)', borderRadius: '6px', padding: '5px 14px', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer' }}
                        >
                          📄 View Receipt
                        </button>
                      </div>
                    </div>
                  ))
                }
              </div>
            )}
          </div>
        )}
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
  const [activeTab, setActiveTab] = useState('bookings');
  const adminPassword = '2026';

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
    <div className="booking-section" style={{ minHeight: '100vh', padding: '160px 2rem 5rem' }}>
      <Navbar />
      {receiptBooking && <ReceiptModal booking={receiptBooking} onClose={() => setReceiptBooking(null)} />}

      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '800' }}>
            Global <span style={{ color: '#00c2a8' }}>Bookings</span>
          </h1>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button onClick={fetchBookings} className="btn-next" style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem' }}>↻ Refresh</button>
            <button onClick={() => setIsAuthorized(false)} className="btn-back">LOGOUT</button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem' }}>
          {[
            { key: 'bookings', label: '📋 Bookings List' },
            { key: 'calendar', label: '📅 Calendar' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding: '0.55rem 1.4rem',
                borderRadius: '8px',
                border: activeTab === tab.key ? '1.5px solid #00c2a8' : '1.5px solid rgba(255,255,255,0.12)',
                background: activeTab === tab.key ? 'rgba(0,194,168,0.15)' : 'rgba(255,255,255,0.04)',
                color: activeTab === tab.key ? '#00c2a8' : 'rgba(255,255,255,0.55)',
                fontWeight: '700',
                fontSize: '0.88rem',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'calendar' && (
          <CalendarTab bookings={bookings} onViewReceipt={b => setReceiptBooking(b)} />
        )}

        {activeTab === 'bookings' && <div className="summary-card" style={{ padding: '0', overflowX: 'auto' }}>
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
        </div>}
      </div>
    </div>
  );
}
