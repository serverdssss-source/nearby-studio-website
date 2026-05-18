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

    // Coupon state
    const [couponCode, setCouponCode] = useState('');
    const [couponApplied, setCouponApplied] = useState(false);
    const [couponLoading, setCouponLoading] = useState(false);
    const [couponError, setCouponError] = useState('');

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

    // Handle Fetching the Timeslots when Date is picked (pre-fetch on step 3, refresh on step 4)
    useEffect(() => {
        if ((currentStep === 3 || currentStep === 4) && selectedDate && selectedPackage) {
            fetchAvailability();
        }
    }, [currentStep, selectedDate, selectedPackage, selectedDuration, extraHours]);

    // Helper for formatting time (e.g. "02:00 PM" -> "2:00 PM")
    const formatTimeHHMM = (timeStr) => {
        let [time, meridiem] = timeStr.trim().split(' ');
        let [h, m] = time.split(':').map(Number);
        return `${h}:${String(m).padStart(2, '0')} ${meridiem}`;
    };

    // Convert "9:00 AM" / "4:30 PM" string → minutes from midnight (for numeric comparison)
    const timeStrToMins = (timeStr) => {
        const [time, mer] = timeStr.trim().split(' ');
        let [h, m] = time.split(':').map(Number);
        if (mer === 'PM' && h !== 12) h += 12;
        if (mer === 'AM' && h === 12) h = 0;
        return h * 60 + m;
    };

    // Add N hours to a time string — returns display string like "02:00 PM"
    const addHoursToTime = (timeStr, hours) => {
        const startMins = timeStrToMins(timeStr);
        const totalMins = startMins + hours * 60;
        const dayMins = totalMins % (24 * 60); // wrap within 24h for display
        const newH = Math.floor(dayMins / 60);
        const newM = dayMins % 60;
        const mer = newH >= 12 ? 'PM' : 'AM';
        const displayH = newH > 12 ? newH - 12 : (newH === 0 ? 12 : newH);
        return `${String(displayH).padStart(2, '0')}:${String(newM).padStart(2, '0')} ${mer}`;
    };

    // Valid coupon codes (client-side fast check — server re-validates on booking)
    const VALID_COUPONS = ['SS308612', 'BUZZIWAH308612', 'INHOUSESS1'];

    // Coupon handlers
    const handleApplyCoupon = () => {
        if (!couponCode.trim()) return;
        setCouponLoading(true);
        setCouponError('');
        const entered = couponCode.trim().toUpperCase();
        if (VALID_COUPONS.includes(entered)) {
            setCouponApplied(true);
            setCouponError('');
        } else {
            setCouponError('Invalid coupon code. Please try again.');
            setCouponApplied(false);
        }
        setCouponLoading(false);
    };

    const handleFreeBooking = async () => {
        setIsProcessing(true);
        try {
            const totalHoursLabel = selectedDuration
                ? (hourlyRates[selectedPackage.name]
                    ? `${parseInt(selectedDuration.label.split(' ')[0]) + extraHours} Hours`
                    : selectedDuration.label)
                : '';

            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/free-booking`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    couponCode: couponCode.trim(),
                    bookingData: {
                        packageId: selectedPackage.id,
                        packageName: `${selectedPackage.name} (${totalHoursLabel})`,
                        packageDescription: selectedPackage.features ? selectedPackage.features.join(', ') : '',
                        date: selectedDate,
                        startTime: selectedSlot.startTime,
                        endTime: selectedSlot.endTime,
                        clientDetails: {
                            name: clientDetails.name || 'In-House Booking',
                            email: clientDetails.email || '',
                            phone: clientDetails.phone || 'N/A',
                            company: clientDetails.company || '',
                            gst: clientDetails.gst || '',
                            notes: clientDetails.notes || ''
                        }
                    }
                })
            });
            if (!res.ok) throw new Error('Booking failed');
            const data = await res.json();
            setBookingId(data.bookingId);
            setIsConfirmed(true);
            setCurrentStep(7);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (err) {
            alert('Error creating free booking. Please try again.');
            setIsProcessing(false);
        }
    };

    const fetchAvailability = async () => {
        setIsLoadingSlots(true);
        try {
            // Compute actual total session hours
            const baseHours = selectedDuration ? parseInt(selectedDuration.label.split(' ')[0]) : 2;
            const totalHours = baseHours + extraHours;

            // Studio open 9 AM – 8 PM. Filter numerically (avoids midnight-wrap string bugs)
            const CLOSE_MINS = 20 * 60; // 8 PM = 1200 mins from midnight
            const startTimes = ['9:00 AM', '11:30 AM', '2:00 PM', '4:30 PM', '6:00 PM'];
            let generatedSlots = startTimes
                .filter(s => {
                    const endMins = timeStrToMins(s) + totalHours * 60;
                    return !isNaN(endMins) && endMins <= CLOSE_MINS;
                })
                .map(s => ({
                    startTime: formatTimeHHMM(s),
                    endTime: formatTimeHHMM(addHoursToTime(s, totalHours))
                }));

            const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const res = await fetch(`${baseUrl}/api/availability?date=${selectedDate}&packageDuration=${selectedPackage.duration}`);
            if (res.ok) {
                const data = await res.json();
                const booked = data.bookedSlots || [];
                // Match by start time only — a booked slot blocks regardless of duration
                generatedSlots = generatedSlots.map(slot => ({
                    ...slot,
                    disabled: booked.some(b => formatTimeHHMM(b.startTime) === slot.startTime)
                }));
            }
            setAvailableSlots(generatedSlots);
        } catch (err) {
            console.error(err);
            // Fallback — same numeric filter
            const baseHours = selectedDuration ? parseInt(selectedDuration.label.split(' ')[0]) : 2;
            const totalHours = baseHours + extraHours;
            const CLOSE_MINS = 20 * 60;
            const startTimes = ['9:00 AM', '11:30 AM', '2:00 PM', '4:30 PM', '6:00 PM'];
            setAvailableSlots(
                startTimes
                    .filter(s => {
                        const endMins = timeStrToMins(s) + totalHours * 60;
                        return !isNaN(endMins) && endMins <= CLOSE_MINS;
                    })
                    .map(s => ({
                        startTime: formatTimeHHMM(s),
                        endTime: formatTimeHHMM(addHoursToTime(s, totalHours)),
                        disabled: false
                    }))
            );
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

            const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const res = await fetch(`${baseUrl}/api/orders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData)
            });

            if (!res.ok) throw new Error("Failed to generate order");
            const { order, bookingId: DBid } = await res.json();

            const scriptLoaded = await loadScript('https://checkout.razorpay.com/v1/checkout.js');
            if (!scriptLoaded) throw new Error("Payment gateway failed to load");

            const options = {
                key: 'rzp_live_STO3Shm8RmFNex',
                amount: order.amount,
                currency: order.currency,
                name: 'Nearby Studio',
                description: `Booking for ${selectedPackage.name}`,
                order_id: order.id,
                handler: async function (response) {
                    try {
                        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
                        const verifyRes = await fetch(`${baseUrl}/api/verify`, {
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
        if (currentStep === 5) return couponApplied || (clientDetails.name && clientDetails.email && clientDetails.phone);
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
            const allSlotsUnavailable = !isLoadingSlots && availableSlots.length === 0;
            const allBooked = !isLoadingSlots && availableSlots.length > 0 && availableSlots.every(s => s.disabled);

            const suggestNextDate = () => {
                const next = new Date(selectedDate);
                next.setDate(next.getDate() + 1);
                const iso = next.toISOString().split('T')[0];
                setSelectedDate(iso);
                setSelectedSlot(null);
                setCurrentStep(3);
            };

            const nextDateLabel = () => {
                const next = new Date(new Date(selectedDate).getTime() + 86400000);
                return next.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' });
            };

            return (
                <motion.div key="step-time" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <h2 className="step-title" style={{ marginBottom: "2rem" }}>
                        Select a Time Slot — {selectedDate}
                        <span style={{ display: 'block', fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', fontWeight: 400, marginTop: '4px' }}>
                            Studio hours: 9:00 AM – 8:00 PM
                        </span>
                    </h2>

                    {isLoadingSlots ? (
                        <div style={{ textAlign: 'center', padding: '3rem' }}>
                            <span className="spinner"></span> Checking system availability...
                        </div>
                    ) : (allSlotsUnavailable || allBooked) ? (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                            style={{ textAlign: 'center', padding: '3rem 2rem', background: 'rgba(255,100,100,0.05)', border: '1px solid rgba(255,100,100,0.2)', borderRadius: '16px' }}>
                            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🚫</div>
                            <h3 style={{ color: '#ff6b6b', marginBottom: '0.75rem' }}>
                                {allBooked ? 'All slots are booked for this date' : 'No available slots for this date'}
                            </h3>
                            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', marginBottom: '0.4rem' }}>
                                {allSlotsUnavailable
                                    ? `Your ${(selectedDuration ? parseInt(selectedDuration.label.split(' ')[0]) + extraHours : 2)}-hour session would end after 8:00 PM on ${selectedDate}.`
                                    : `All time slots on ${selectedDate} are already taken.`}
                            </p>
                            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', marginBottom: '2rem' }}>
                                Please choose a different date — studio opens daily at 9:00 AM.
                            </p>
                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                                <button className="btn-back" onClick={() => setCurrentStep(3)}>← Pick Another Date</button>
                                <button className="btn-next" onClick={suggestNextDate}>Try {nextDateLabel()} →</button>
                            </div>
                        </motion.div>
                    ) : (
                        <div className="time-grid">
                            {availableSlots.map((slot, i) => (
                                <div
                                    key={i}
                                    className={`time-slot ${slot.disabled ? 'disabled' : ''} ${selectedSlot?.startTime === slot.startTime ? 'selected' : ''}`}
                                    onClick={() => !slot.disabled && setSelectedSlot(slot)}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                        <span>{slot.startTime} – {slot.endTime}</span>
                                    </div>
                                    {slot.disabled && <div style={{ fontSize: '0.7rem', marginTop: '4px', color: '#ff4d4d' }}>Booked</div>}
                                    {!slot.disabled && selectedSlot?.startTime === slot.startTime && <div style={{ fontSize: '0.7rem', marginTop: '4px', color: '#00c2a8' }}>Selected ✓</div>}
                                </div>
                            ))}
                        </div>
                    )}
                </motion.div>
            );
        }

        // 5. CLIENT DETAILS + COUPON
        if (currentStep === 5) {
            return (
                <motion.div key="step-details" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <h2 className="step-title" style={{ marginBottom: "1.5rem" }}>Your Details</h2>

                    {/* ── Coupon Code Section ── */}
                    <div style={{ marginBottom: '2rem', padding: '1.25rem 1.5rem', background: 'rgba(0,194,168,0.05)', border: '1px solid rgba(0,194,168,0.2)', borderRadius: '12px' }}>
                        <label style={{ display: 'block', marginBottom: '0.75rem', fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                            Have a Coupon Code?
                        </label>
                        {couponApplied ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#00c2a8', fontWeight: '600', fontSize: '1rem' }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00c2a8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                Coupon applied — This booking is <strong style={{ marginLeft: '4px' }}>FREE</strong>!
                                <button
                                    onClick={() => { setCouponApplied(false); setCouponCode(''); }}
                                    style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: '0.8rem', textDecoration: 'underline' }}
                                >
                                    Remove
                                </button>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                                <input
                                    type="text"
                                    value={couponCode}
                                    onChange={e => { setCouponCode(e.target.value.toUpperCase()); setCouponError(''); }}
                                    onKeyDown={e => e.key === 'Enter' && handleApplyCoupon()}
                                    placeholder="Enter coupon code"
                                    style={{ flex: 1, minWidth: '160px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '0.7rem 1rem', color: '#fff', fontSize: '0.95rem', outline: 'none', letterSpacing: '0.08em' }}
                                />
                                <button
                                    onClick={handleApplyCoupon}
                                    disabled={couponLoading || !couponCode.trim()}
                                    className="btn-next"
                                    style={{ padding: '0.7rem 1.4rem', minWidth: 'auto', opacity: (!couponCode.trim() ? 0.5 : 1) }}
                                >
                                    {couponLoading ? <span className="spinner"></span> : 'Apply'}
                                </button>
                            </div>
                        )}
                        {couponError && (
                            <p style={{ marginTop: '0.5rem', color: '#ff6b6b', fontSize: '0.85rem' }}>{couponError}</p>
                        )}
                    </div>

                    {/* ── Details Form (hidden / optional when coupon applied) ── */}
                    {couponApplied ? (
                        <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', textAlign: 'center', color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}>
                            <p>Your coupon unlocks a <strong style={{ color: '#00c2a8' }}>free in-house booking</strong>. No payment required.</p>
                            <p style={{ marginTop: '0.5rem', fontSize: '0.8rem' }}>Optionally fill in your details below for a confirmation email.</p>
                        </div>
                    ) : null}

                    <div className="booking-form" style={{ marginTop: couponApplied ? '1.5rem' : '0' }}>
                        <div className="b-form-group">
                            <label>Full Name {couponApplied ? '(Optional)' : '*'}</label>
                            <input type="text" name="name" value={clientDetails.name} onChange={handleInputChange} placeholder="Enter your full name" required={!couponApplied} />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                            <div className="b-form-group">
                                <label>Email Address {couponApplied ? '(Optional)' : '*'}</label>
                                <input type="email" name="email" value={clientDetails.email} onChange={handleInputChange} placeholder="john@example.com" required={!couponApplied} />
                            </div>
                            <div className="b-form-group">
                                <label>Phone Number {couponApplied ? '(Optional)' : '*'}</label>
                                <input type="tel" name="phone" value={clientDetails.phone} onChange={handleInputChange} placeholder="+91 XXXXX XXXXX" required={!couponApplied} />
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

                    <div className="summary-item">
                        <span className="summary-label">Subtotal</span>
                        <span className="summary-value">₹{((selectedDuration?.price || 0) + (extraHours * (hourlyRates[selectedPackage.name]?.extra || 0))).toLocaleString('en-IN')}</span>
                    </div>

                    <div className="summary-item">
                        <span className="summary-label">CGST (9%)</span>
                        <span className="summary-value">₹{Math.round(((selectedDuration?.price || 0) + (extraHours * (hourlyRates[selectedPackage.name]?.extra || 0))) * 0.09).toLocaleString('en-IN')}</span>
                    </div>

                    <div className="summary-item">
                        <span className="summary-label">SGST (9%)</span>
                        <span className="summary-value">₹{Math.round(((selectedDuration?.price || 0) + (extraHours * (hourlyRates[selectedPackage.name]?.extra || 0))) * 0.09).toLocaleString('en-IN')}</span>
                    </div>

                    <div className="summary-total" style={{ borderTop: "1px dashed rgba(255,255,255,0.2)", marginTop: "1rem", paddingTop: "1rem" }}>
                        <span>Total <span style={{ fontSize: "0.75rem", fontWeight: "normal", color: "rgba(255,255,255,0.5)" }}>(Incl. GST)</span></span>
                        {couponApplied ? (
                            <span>
                                <span style={{ textDecoration: 'line-through', opacity: 0.4, marginRight: '8px', fontSize: '0.85rem' }}>
                                    ₹{(Math.round(((selectedDuration?.price || 0) + (extraHours * (hourlyRates[selectedPackage.name]?.extra || 0))) * 1.18)).toLocaleString('en-IN')}
                                </span>
                                <span style={{ color: '#00c2a8' }}>₹0 FREE</span>
                            </span>
                        ) : (
                            <span>₹{(Math.round(((selectedDuration?.price || 0) + (extraHours * (hourlyRates[selectedPackage.name]?.extra || 0))) * 1.18)).toLocaleString('en-IN')}</span>
                        )}
                    </div>
                    {couponApplied && (
                        <div style={{ marginTop: '0.75rem', padding: '0.5rem 0.75rem', background: 'rgba(0,194,168,0.1)', borderRadius: '8px', fontSize: '0.8rem', color: '#00c2a8', textAlign: 'center' }}>
                            ✓ Coupon applied — Booking is free
                        </div>
                    )}
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
                                            currentStep === 5 && couponApplied ? (
                                                <button
                                                    className="btn-next payment-btn"
                                                    onClick={handleFreeBooking}
                                                    disabled={isProcessing}
                                                >
                                                    {isProcessing ? <><span className="spinner"></span>Booking...</> : 'Book for Free — ₹0'}
                                                </button>
                                            ) : (
                                                <button
                                                    className="btn-next"
                                                    onClick={() => setCurrentStep(prev => prev + 1)}
                                                    disabled={!canProceed() || isLoadingSlots}
                                                >
                                                    Continue
                                                </button>
                                            )
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
