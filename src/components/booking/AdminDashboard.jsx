import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navbar from '../Navbar';
import SripadaInvoice from '../Invoice';
import './BookingFlow.css';

export default function AdminDashboard() {
    const [bookings, setBookings] = useState([]);
    const [password, setPassword] = useState('');
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [selectedInvoiceBooking, setSelectedInvoiceBooking] = useState(null);

    const fetchBookings = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`/api/admin/bookings?password=${password}`);
            if (response.ok) {
                const data = await response.json();
                setBookings(data);
                setIsAuthorized(true);
                setError('');
            } else {
                setError('Invalid password or unauthorized access.');
            }
        } catch (err) {
            setError('Connection failed. Is the server running?');
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogin = (e) => {
        e.preventDefault();
        fetchBookings();
    };

    if (!isAuthorized) {
        return (
            <div className="booking-section" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Navbar />
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="summary-card"
                    style={{ maxWidth: '400px', width: '90%' }}
                >
                    <h2 style={{ marginBottom: '2rem', textAlign: 'center', color: '#00c2a8' }}>Admin Login</h2>
                    <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div className="b-form-group">
                            <label>Admin Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter secure key..."
                                required
                            />
                        </div>
                        {error && <p style={{ color: '#ff4444', fontSize: '0.8rem' }}>{error}</p>}
                        <button type="submit" className="btn-next" style={{ width: '100%' }}>
                            ACCESS DASHBOARD
                        </button>
                    </form>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="booking-section" style={{ minHeight: '100vh', padding: '120px 2rem 5rem' }}>
            <Navbar />
            <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: '800' }}>
                        Global <span style={{ color: '#00c2a8' }}>Bookings</span>
                    </h1>
                    <button onClick={() => setIsAuthorized(false)} className="btn-back">LOGOUT</button>
                </div>

                {selectedInvoiceBooking ? (
                    <div style={{ backgroundColor: 'white', borderRadius: '8px', overflow: 'hidden' }}>
                        <SripadaInvoice 
                            invoice={{
                                id: selectedInvoiceBooking.id.toString(),
                                invoiceNo: "INV-" + selectedInvoiceBooking.booking_id,
                                gstNumber: "29XXXXX0000X1Z5",
                                clientId: selectedInvoiceBooking.id.toString(),
                                clientName: selectedInvoiceBooking.client_name,
                                clientEmail: selectedInvoiceBooking.client_email,
                                clientPhone: selectedInvoiceBooking.client_phone,
                                clientGSTID: selectedInvoiceBooking.client_gst || "",
                                clientAddress: selectedInvoiceBooking.client_company || "N/A",
                                serviceDescription: selectedInvoiceBooking.package_name + (selectedInvoiceBooking.client_notes ? " - " + selectedInvoiceBooking.client_notes : ""),
                                servicePeriodFrom: selectedInvoiceBooking.booking_date,
                                servicePeriodTo: selectedInvoiceBooking.booking_date,
                                date: new Date(selectedInvoiceBooking.created_at).toISOString().split('T')[0],
                                status: selectedInvoiceBooking.payment_status === "Paid" ? "paid" : "draft",
                                amount: selectedInvoiceBooking.amount,
                                cgstRate: 9,
                                sgstRate: 9,
                                studioName: "Sripada Studios",
                                studioGSTNumber: "29XXXXX0000X1Z5",
                                studioAddress: "No:4/2, 1st Floor, Chord Rd, Rajaji Nagar Industrial Town, Rajajinagar, Bengaluru, Karnataka 560 010",
                                studioPhone: "+91 9060870117",
                                studioWebsite: "www.sripadastudios.com",
                                studioEmail: "contact@sripadastudios.com",
                                bankAccountHolder: "Sripada Studios Private Limited",
                                bankAccountNumber: "44797145260",
                                bankName: "State Bank of India, Rajaji Nagar IND Estate",
                                ifscCode: "SBIN0000762",
                                upiId: "sripadastudios5260@sbi"
                            }} 
                            onBack={() => setSelectedInvoiceBooking(null)} 
                            onSendEmail={(invoiceNo) => console.log('Successfully sent', invoiceNo)} 
                        />
                    </div>
                ) : (
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
                                <th style={{ padding: '1.5rem' }}>Actions</th>
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
                                    </td>
                                    <td style={{ padding: '1.25rem' }}>
                                        <div style={{ color: '#00c2a8' }}>{b.package_name}</div>
                                    </td>
                                    <td style={{ padding: '1.25rem' }}>
                                        <div>{new Date(b.booking_date).toLocaleDateString()}</div>
                                        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem' }}>{b.start_time} - {b.end_time}</div>
                                    </td>
                                    <td style={{ padding: '1.25rem' }}>
                                        ₹{b.amount.toLocaleString()}
                                    </td>
                                    <td style={{ padding: '1.25rem' }}>
                                        <span style={{
                                            background: b.payment_status === 'Paid' ? 'rgba(0,194,168,0.1)' : 'rgba(255,68,68,0.1)',
                                            color: b.payment_status === 'Paid' ? '#00c2a8' : '#ff4444',
                                            padding: '4px 10px',
                                            borderRadius: '4px',
                                            fontSize: '0.75rem',
                                            fontWeight: '700'
                                        }}>
                                            {b.payment_status === 'Paid' ? 'CONFIRMED' : 'UNPAID'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1.25rem' }}>
                                        <button 
                                            onClick={() => setSelectedInvoiceBooking(b)}
                                            style={{
                                                background: '#327d7d',
                                                color: 'white',
                                                border: 'none',
                                                padding: '6px 12px',
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                                fontSize: '0.8rem',
                                                fontWeight: '600'
                                            }}
                                        >
                                            View Invoice
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {bookings.length === 0 && (
                        <div style={{ padding: '4rem', textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>
                            No bookings found in the database.
                        </div>
                    )}
                </div>
                )}
            </div>
        </div>
    );
}
