import { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../Navbar';
import './BookingFlow.css';

// Predefined Packages for direct entry (if they didn't come from a specific page)
const fallbackPackages = [
    { id: 'podcast_2h', name: 'Podcast Recording', duration: '2 Hours', price: 3000, features: ['Studio room access', '3 professional microphones', 'Audio recording setup', 'Sound engineer assistance'] },
    { id: 'podcast_4h', name: 'Podcast Suite (Pro)', duration: '4 Hours', price: 5500, features: ['Studio room access', 'Up to 4 professional microphones', 'Multi-angle video setup included', 'Sound engineer assistance'] },
    { id: 'studio_half', name: 'Photo Studio Session', duration: 'Half Day (4 hrs)', price: 12000, features: ['AC Indoor Studio Setup', '1 Cameraman + Camera', 'Makeup & Dressing Room', '15–25 Edited Images Inclusive'] },
    { id: 'test_service', name: 'Test Payment Service', duration: '15 Mins', price: 1, features: ['Technical testing only', 'Live transaction verification'] }
];

export default function BookingFlow() {
    const location = useLocation();
    const navigate = useNavigate();

    // If user clicked a Book Now button from another page, we grab the package
    const initialPackage = location.state?.package || null;
    const initialStep = initialPackage ? 2 : 1;

    const [currentStep, setCurrentStep] = useState(initialStep);
    // Provide fallback objects to avoid destructuring nulls in rendering
    const [selectedPackage, setSelectedPackage] = useState(initialPackage);
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [selectedMonthIndex, setSelectedMonthIndex] = useState(0);
    const [selectedDuration, setSelectedDuration] = useState(null); // { label: '2 Hours', price: 3000 }
    const [extraHours, setExtraHours] = useState(0);
    const [clientDetails, setClientDetails] = useState({ name: '', email: '', phone: '', company: '', gst: '', notes: '' });

    const [availableSlots, setAvailableSlots] = useState([]);
    const [isLoadingSlots, setIsLoadingSlots] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isConfirmed, setIsConfirmed] = useState(false);
    const [bookingId, setBookingId] = useState('');

    const steps = ['Package', 'Duration', 'Date', 'Time', 'Details', 'Payment'];

    const hourlyRates = {
        "1 Camera Setup": { tiers: [{ label: '2 Hours', price: 3000 }, { label: '4 Hours', price: 6000 }, { label: '8 Hours', price: 12000 }], extra: 1500 },
        "2 Camera Setup": { tiers: [{ label: '2 Hours', price: 4200 }, { label: '4 Hours', price: 8400 }, { label: '8 Hours', price: 16800 }], extra: 2100 },
        "3 Camera Setup": { tiers: [{ label: '2 Hours', price: 5400 }, { label: '4 Hours', price: 10800 }, { label: '8 Hours', price: 21600 }], extra: 2700 },
        "2 Hour Session": { tiers: [{ label: '2 Hours', price: 1800 }], extra: 900 },
        "5 Hour Session": { tiers: [{ label: '5 Hours', price: 4449 }], extra: 900 },
        "Full Day Session": { tiers: [{ label: '8 Hours', price: 7200 }], extra: 900 }
    };

    // If the browser cached a dirty history state with price 0, we forcefully fix it here
    useEffect(() => {
        if (selectedPackage && (!selectedPackage.price || selectedPackage.price === 0)) {
            const priceMap = {
                "2 Hour Session": 1800,
                "5 Hour Session": 4449,
                "Full Day Session": 7200,
                "1 Camera Setup": 3000,
                "2 Camera Setup": 4200,
                "3 Camera Setup": 5400,
                "Custom Setup": 3499,
                "The Founders Room - 1": 24999,
                "Round Table Conference": 54999,
                "The Social Podcast — 1": 24999,
                "Your Coffee Show": 54999,
                "Half Day": 12000,
                "Full Day": 20000,
                "Package 1": 4500,
                "Package 2": 9999,
                "Studio Snapshot": 2999,
                "Podcast Recording": 3000,
                "Podcast Suite (Pro)": 5500,
                "Photo Studio Session": 12000,
                "Test Payment Service": 1
            };
            const forcedPrice = priceMap[selectedPackage.name] || 0;
            if (forcedPrice > 0) {
                setSelectedPackage(prev => ({ ...prev, price: forcedPrice }));
            }
        }
    }, [selectedPackage]);

    // Auto-select duration if only one tier exists
    useEffect(() => {
        if (selectedPackage && !selectedDuration) {
            const config = hourlyRates[selectedPackage.name];
            if (config && config.tiers.length === 1) {
                setSelectedDuration(config.tiers[0]);
            } else if (!config && selectedPackage.duration && selectedPackage.price) {
                // For packages not in hourlyRates (like Test Service), use their inherent duration/price
                setSelectedDuration({ label: selectedPackage.duration, price: selectedPackage.price });
            }
        }
    }, [selectedPackage, selectedDuration]);

    // Generate 60 Days for Custom Calendar Grid
    const selectableDatesByMonth = useMemo(() => {
        const dates = [];
        const today = new Date();
        for (let i = 0; i < 60; i++) {
            const d = new Date(today);
            d.setDate(today.getDate() + i);
            const isoString = d.toISOString().split('T')[0];
            dates.push({
                dateObj: d,
                iso: isoString,
                dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
                dayNum: d.getDate(),
                monthName: d.toLocaleDateString('en-US', { month: 'short' }),
                fullMonthName: d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
            });
        }

        const grouped = [];
        dates.forEach(d => {
            let group = grouped.find(g => g.month === d.fullMonthName);
            if (!group) {
                group = { month: d.fullMonthName, days: [] };
                grouped.push(group);
            }
            group.days.push(d);
        });
        return grouped;
    }, []);

    // Handle Fetching the Timeslots when Date is picked
    useEffect(() => {
        if (currentStep === 3 && selectedDate && selectedPackage) {
            fetchAvailability();
        }
    }, [currentStep, selectedDate, selectedPackage]);

    const fetchAvailability = async () => {
        setIsLoadingSlots(true);
        try {
            let generatedSlots = [
                { startTime: '10:00 AM', endTime: '12:00 PM' },
                { startTime: '12:30 PM', endTime: '2:30 PM' },
                { startTime: '3:00 PM', endTime: '5:00 PM' },
                { startTime: '6:00 PM', endTime: '8:00 PM' }
            ];

            const res = await fetch(`/api/availability?date=${selectedDate}&packageDuration=${selectedPackage.duration}`);
            if (res.ok) {
                const data = await res.json();
                const booked = data.bookedSlots || [];
                generatedSlots = generatedSlots.map(slot => ({
                    ...slot,
                    disabled: booked.some(b => b.startTime === slot.startTime && b.endTime === slot.endTime)
                }));
            }
            setAvailableSlots(generatedSlots);
        } catch (err) {
            console.error(err);
            setAvailableSlots([
                { startTime: '10:00 AM', endTime: '12:00 PM', disabled: false },
                { startTime: '12:30 PM', endTime: '2:30 PM', disabled: false },
                { startTime: '3:00 PM', endTime: '5:00 PM', disabled: false },
                { startTime: '6:00 PM', endTime: '8:00 PM', disabled: false }
            ]);
        } finally {
            setIsLoadingSlots(false);
        }
    };

    const loadScript = (src) => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handlePayment = async () => {
        setIsProcessing(true);
        try {
            const amountWithGst = selectedPackage.price;

            const orderData = {
                amount: (selectedDuration?.price || 0) + (extraHours * (hourlyRates[selectedPackage.name]?.extra || 0)),
                bookingData: {
                    packageId: selectedPackage.id,
                    packageName: `${selectedPackage.name} (${selectedDuration?.label}${extraHours > 0 ? ` + ${extraHours}h` : ''})`,
                    date: selectedDate,
                    startTime: selectedSlot.startTime,
                    endTime: selectedSlot.endTime,
                    clientDetails: clientDetails
                }
            };

            const res = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData)
            });

            if (!res.ok) throw new Error("Failed to generate order");
            const { order, bookingId: DBid } = await res.json();

            const scriptLoaded = await loadScript('https://checkout.razorpay.com/v1/checkout.js');
            if (!scriptLoaded) throw new Error("Payment gateway failed to load");

            const options = {
                key: 'rzp_live_SP5V36UiWeixm2',
                amount: order.amount,
                currency: order.currency,
                name: 'Nearby Studio',
                description: `Booking for ${selectedPackage.name}`,
                order_id: order.id,
                handler: async function (response) {
                    try {
                        const verifyRes = await fetch('/api/verify', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ ...response, bookingId: DBid })
                        });

                        if (!verifyRes.ok) throw new Error("Verification failed");

                        console.log("Payment Verified Successfully in DB:", DBid);
                        setBookingId(DBid);
                        setIsConfirmed(true);
                        setCurrentStep(7);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    } catch (err) {
                        console.error("Verification Error:", err);
                        alert('Payment verified on gateway, but server failed to update. Please contact support with Booking ID: ' + DBid);
                        setIsProcessing(false);
                    }
                },
                prefill: {
                    name: clientDetails.name,
                    email: clientDetails.email,
                    contact: clientDetails.phone
                },
                theme: { color: '#00c2a8' }
            };

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', function (resp) {
                alert("Payment Failed: " + resp.error.description);
                setIsProcessing(false);
            });
            rzp.open();

        } catch (err) {
            console.error(err);
            alert("Error initiating payment");
            setIsProcessing(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setClientDetails(prev => ({ ...prev, [name]: value }));
    };

    const canProceed = () => {
        if (currentStep === 1) return selectedPackage !== null;
        if (currentStep === 2) return selectedDuration !== null;
        if (currentStep === 3) return selectedDate !== '';
        if (currentStep === 4) return selectedSlot !== null;
        if (currentStep === 5) return clientDetails.name && clientDetails.email && clientDetails.phone;
        return true;
    };

    const renderLeftPanelContent = () => {
        // 1. PACKAGE SELECTION (Only visible if accessed directly)
        if (currentStep === 1) {
            return (
                <motion.div key="step-package" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <h2 className="step-title">Select a Base Package</h2>
                    <div className="package-grid">
                        {fallbackPackages.map(pkg => (
                            <div
                                key={pkg.id}
                                className={`package-card ${selectedPackage?.id === pkg.id ? 'selected' : ''}`}
                                onClick={() => setSelectedPackage(pkg)}
                            >
                                <div className="pkg-name">{pkg.name}</div>
                                <div className="pkg-duration">{pkg.duration}</div>
                                <div className="pkg-price">₹{pkg.price.toLocaleString('en-IN')}</div>
                                <div className="pkg-includes">
                                    <p>Includes:</p>
                                    <ul className="pkg-features">
                                        {pkg.features.map((f, i) => <li key={i}>{f}</li>)}
                                    </ul>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            );
        }

        // 2. DURATION SELECTION (NEW)
        if (currentStep === 2) {
            const config = hourlyRates[selectedPackage.name];
            return (
                <motion.div key="step-duration" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <h2 className="step-title">Select Session Duration</h2>
                    <p style={{ color: "rgba(255,255,255,0.5)", marginBottom: "2rem" }}>Choose a base tier or add extra time to your session.</p>

                    {config ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                            <div className="package-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                                {config.tiers.map((tier, idx) => (
                                    <div
                                        key={idx}
                                        className={`package-card ${selectedDuration?.label === tier.label ? 'selected' : ''}`}
                                        onClick={() => {
                                            setSelectedDuration(tier);
                                            // Extract base numeric value from label (e.g. "2 Hours" -> 2)
                                            const baseHours = parseInt(tier.label.split(' ')[0]);
                                            // Reset extra hours if we change tier
                                            setExtraHours(0);
                                        }}
                                    >
                                        <div className="pkg-name">{tier.label} Session</div>
                                        <div className="pkg-price">{tier.price.toLocaleString('en-IN')}</div>
                                    </div>
                                ))}
                            </div>

                            {selectedDuration && (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="summary-card" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <h4 style={{ margin: 0, color: '#00c2a8' }}>Add Extra Hours?</h4>
                                            <p style={{ fontSize: '0.8rem', opacity: 0.6 }}>₹{config.extra.toLocaleString('en-IN')} per additional hour</p>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <button onClick={() => setExtraHours(prev => Math.max(0, prev - 1))} className="btn-back" style={{ padding: '5px 15px', minWidth: 'auto' }}>-</button>
                                            <span style={{ fontSize: '1.2rem', fontWeight: '700', minWidth: '30px', textAlign: 'center' }}>{extraHours}</span>
                                            <button onClick={() => setExtraHours(prev => Math.min(10, prev + 1))} className="btn-next" style={{ padding: '5px 15px', minWidth: 'auto' }}>+</button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    ) : (
                        <div style={{ padding: '2rem', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
                            <p>This package has a fixed duration of <strong style={{ color: '#00c2a8' }}>{selectedPackage.duration}</strong>.</p>
                            <button onClick={() => setSelectedDuration({ label: selectedPackage.duration, price: selectedPackage.price })} className="btn-next">ACKNOWLEDGE DURATION</button>
                        </div>
                    )}
                </motion.div>
            );
        }

        // 3. DATE SELECTION
        if (currentStep === 3) {
            return (
                <motion.div key="step-date" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <div className="date-header-row">
                        <h2 className="step-title" style={{ margin: 0 }}>Select a Date</h2>
                        <select
                            value={selectedMonthIndex}
                            onChange={(e) => setSelectedMonthIndex(Number(e.target.value))}
                            className="month-select"
                        >
                            {selectableDatesByMonth.map((group, idx) => (
                                <option key={idx} value={idx} style={{ background: '#0F0F12', color: '#fff' }}>
                                    {group.month}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="interactive-dates-wrapper">
                        {selectableDatesByMonth[selectedMonthIndex] && (
                            <div style={{ marginBottom: '2rem' }}>
                                <div className="interactive-dates-grid">
                                    {selectableDatesByMonth[selectedMonthIndex].days.map((day) => (
                                        <div
                                            key={day.iso}
                                            className={`date-block ${selectedDate === day.iso ? 'selected' : ''}`}
                                            onClick={() => { setSelectedDate(day.iso); setSelectedSlot(null); }}
                                        >
                                            <span className="date-month">{day.monthName}</span>
                                            <span className="date-num">{day.dayNum}</span>
                                            <span className="date-day">{day.dayName}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>
            );
        }

        // 4. TIME SLOT SELECTION
        if (currentStep === 4) {
            return (
                <motion.div key="step-time" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <h2 className="step-title" style={{ marginBottom: "2rem" }}>Select an arriving Time Slot for {selectedDate}</h2>

                    {isLoadingSlots ? (
                        <div style={{ textAlign: 'center', padding: '3rem' }}>
                            <span className="spinner"></span> Checking system availability...
                        </div>
                    ) : (
                        <div className="time-grid">
                            {availableSlots.map((slot, i) => (
                                <div
                                    key={i}
                                    className={`time-slot ${slot.disabled ? 'disabled' : ''} ${selectedSlot?.startTime === slot.startTime ? 'selected' : ''}`}
                                    onClick={() => !slot.disabled && setSelectedSlot(slot)}
                                >
                                    {slot.startTime} - {slot.endTime}
                                    {slot.disabled && <div style={{ fontSize: "0.7rem", marginTop: "4px", color: "#ff4d4d" }}>Booked</div>}
                                </div>
                            ))}
                        </div>
                    )}
                </motion.div>
            );
        }

        // 5. CLIENT DETAILS
        if (currentStep === 5) {
            return (
                <motion.div key="step-details" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <h2 className="step-title" style={{ marginBottom: "2rem" }}>Your Details</h2>
                    <div className="booking-form">
                        <div className="b-form-group">
                            <label>Full Name *</label>
                            <input type="text" name="name" value={clientDetails.name} onChange={handleInputChange} placeholder="Enter your full name" required />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                            <div className="b-form-group">
                                <label>Email Address *</label>
                                <input type="email" name="email" value={clientDetails.email} onChange={handleInputChange} placeholder="john@example.com" required />
                            </div>
                            <div className="b-form-group">
                                <label>Phone Number *</label>
                                <input type="tel" name="phone" value={clientDetails.phone} onChange={handleInputChange} placeholder="+91 XXXXX XXXXX" required />
                            </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                            <div className="b-form-group">
                                <label>Company Name (Optional)</label>
                                <input type="text" name="company" value={clientDetails.company} onChange={handleInputChange} placeholder="Studio Corp" />
                            </div>
                            <div className="b-form-group">
                                <label>GST Number (Optional)</label>
                                <input type="text" name="gst" value={clientDetails.gst} onChange={handleInputChange} placeholder="29XXXXX0000X1Z5" />
                            </div>
                        </div>
                        <div className="b-form-group">
                            <label>Special Requirements / Notes (Optional)</label>
                            <textarea name="notes" value={clientDetails.notes} onChange={handleInputChange} placeholder="Tell us about your shoot requirements..."></textarea>
                        </div>
                    </div>
                </motion.div>
            );
        }

        // 6. PAYMENT CONFIRMATION SCREEN
        if (currentStep === 6) {
            return (
                <motion.div key="step-payment" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <h2 className="step-title" style={{ marginBottom: "2rem" }}>Payment Gateway</h2>
                    <div style={{ padding: "2rem", background: "rgba(0,194,168,0.05)", border: "1px solid rgba(0,194,168,0.3)", borderRadius: "12px", textAlign: "center" }}>
                        <p style={{ fontSize: "1.1rem", marginBottom: "1rem" }}>You're almost there! Click below to initialize secure payment via Razorpay.</p>
                        <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.9rem", marginBottom: "2rem" }}>If successful, your booking slot will be permanently locked into our system and a PDF receipt will be emailed to <strong>{clientDetails.email}</strong>.</p>
                        <div style={{ fontSize: "1.5rem", fontWeight: "700", color: "#00c2a8" }}>Amount Payable: ₹{(selectedPackage.price || 0).toLocaleString('en-IN')}</div>
                    </div>
                </motion.div>
            )
        }
    };

    const renderRightPanelSummary = () => {
        if (!selectedPackage) return null;
        const basePrice = selectedDuration?.price || 0;
        const extraPrice = extraHours * (hourlyRates[selectedPackage.name]?.extra || 0);
        const total = basePrice + extraPrice;

        return (
            <div className="summary-sticky">
                <div className="summary-card">
                    <h3 className="summary-header">Booking Summary</h3>

                    {/* Add current step indicator to summary on mobile if needed */}

                    <div className="summary-item">
                        <span className="summary-label">Package Selected</span>
                        <span className="summary-value" style={{ color: "#00c2a8" }}>{selectedPackage.name}</span>
                    </div>

                    <div className="summary-item pkg-rate-summary">
                        <span className="summary-label">Base Rate Found</span>
                        <span className="summary-value">₹{total.toLocaleString('en-IN')}</span>
                    </div>

                    <AnimatePresence>
                        {selectedDate && (
                            <motion.div key="summary-date" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="summary-item">
                                <span className="summary-label">Date</span>
                                <span className="summary-value">{selectedDate}</span>
                            </motion.div>
                        )}

                        {selectedSlot && (
                            <motion.div key="summary-time" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="summary-item" style={{ borderBottom: "1px dashed rgba(255,255,255,0.1)" }}>
                                <span className="summary-label">Time</span>
                                <span className="summary-value">{selectedSlot.startTime} to {selectedSlot.endTime}</span>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="summary-item">
                        <span className="summary-label">Selected Duration</span>
                        <span className="summary-value" style={{ color: "#00c2a8" }}>
                            {selectedDuration ? `${selectedDuration.label}${extraHours > 0 ? ` + ${extraHours}h extra` : ''}` : 'Not Selected'}
                        </span>
                    </div>

                    <div className="summary-total" style={{ borderTop: "1px dashed rgba(255,255,255,0.2)", marginTop: "1.5rem", paddingTop: "1.5rem" }}>
                        <span>Total <span style={{ fontSize: "0.75rem", fontWeight: "normal", color: "rgba(255,255,255,0.5)" }}>(Inc. GST)</span></span>
                        <span>₹{((selectedDuration?.price || 0) + (extraHours * (hourlyRates[selectedPackage.name]?.extra || 0))).toLocaleString('en-IN')}</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <Navbar />
            <section className="booking-section">
                <div className="booking-container">

                    <div className="booking-header">
                        <div className="booking-tag">Reserve Your Studio</div>
                        <h1>Studio <span>Bookings</span></h1>
                        {currentStep < 7 && <p className="booking-sub">Step {currentStep} of 6: {steps[currentStep - 1]}</p>}
                    </div>

                    {currentStep < 7 && (
                        <div className="steps-indicator">
                            {steps.map((stepLabel, i) => (
                                <div key={i} className={`step-item ${currentStep > i + 1 ? 'completed' : currentStep === i + 1 ? 'active' : ''}`}>
                                    <div className="step-circle">{currentStep > i + 1 ? '✓' : i + 1}</div>
                                    <span className="step-label">{stepLabel}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="step-content-box">
                        {currentStep === 7 && isConfirmed ? (
                            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="success-screen">
                                <div className="success-icon">
                                    <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#00c2a8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                </div>
                                <h2>Booking Confirmed!</h2>
                                <p>Your session for <strong style={{ color: "#00c2a8" }}>{selectedDate}</strong> at <strong style={{ color: "#00c2a8" }}>{selectedSlot?.startTime}</strong> has been secured.</p>
                                <p className="booking-id-tag">Booking ID: <strong>{bookingId}</strong></p>
                                <p className="success-note">A confirmation email and PDF invoice has been sent to your email address. See you soon!</p>
                                <button onClick={() => navigate('/')} className="btn-home">Return Home</button>
                            </motion.div>
                        ) : (
                            <div className={`booking-layout ${selectedPackage ? 'layout-split' : 'layout-full'}`}>

                                <div className="main-interactive-panel">
                                    <AnimatePresence mode="wait">
                                        {renderLeftPanelContent()}
                                    </AnimatePresence>

                                    <div className="booking-controls" style={{ marginTop: "3rem" }}>
                                        <button
                                            className="btn-back"
                                            onClick={() => setCurrentStep(prev => prev - 1)}
                                            disabled={(currentStep === 1) || (currentStep === 2 && initialPackage && selectedDuration) || isProcessing}
                                        >
                                            Back
                                        </button>

                                        {currentStep < 6 ? (
                                            <button
                                                className="btn-next"
                                                onClick={() => setCurrentStep(prev => prev + 1)}
                                                disabled={!canProceed() || isLoadingSlots}
                                            >
                                                Continue
                                            </button>
                                        ) : (
                                            <button
                                                className="btn-next payment-btn"
                                                onClick={handlePayment}
                                                disabled={isProcessing}
                                            >
                                                {isProcessing ? <><span className="spinner"></span>Processing</> : 'Proceed to Payment — ₹' + (((selectedDuration?.price || 0) + (extraHours * (hourlyRates[selectedPackage.name]?.extra || 0))).toLocaleString('en-IN'))}
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Right Side Sticky Summary Panel */}
                                {selectedPackage && (
                                    <div className="main-summary-panel">
                                        {renderRightPanelSummary()}
                                    </div>
                                )}

                            </div>
                        )}
                    </div>
                </div>
            </section>
        </>
    );
}
