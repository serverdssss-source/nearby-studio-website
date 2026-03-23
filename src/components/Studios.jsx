import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import Navbar from './Navbar'
import ContactForm from './ContactForm'
import InstagramTail from './Instagram_tail'
import './Studios.css'

export default function Studios() {
  const [activePart, setActivePart] = useState('a')
  const whiteFeatures = new Set([
    'Makeup Room',
    'Dressing Room',
    'WiFi',
    'Power Backup',
    'Cafeteria Access',
    'Soundproof Room',
    'Multi-Angle Coverage',
    '3 Wall Studio Setup',
    'Makeup & Dressing Room',
    'WiFi & Power Backup'
  ])

  const packages = {
    a: [
      { id: '01', name: '2 Hour Session', duration: '2 hrs', price: '₹1,800', extra: '₹900', features: ['Makeup Room', 'Dressing Room', 'WiFi', 'Power Backup', 'Cafeteria Access', 'Soundproof Room'] },
      { id: '02', name: '5 Hour Session', duration: '5 hrs', price: '₹4,449', extra: '₹900', features: ['Makeup Room', 'Dressing Room', 'WiFi', 'Power Backup', 'Cafeteria Access', 'Soundproof Room'] },
      { id: '03', name: 'Full Day Session', duration: '8 hrs', price: '₹7,200', extra: '₹900', features: ['Makeup Room', 'Dressing Room', 'WiFi', 'Power Backup', 'Cafeteria Access', 'Soundproof Room'], badge: 'Best Value — Full Day' }
    ],
    b: [
      { id: '01', name: '1 Camera Setup', tiers: [{ label: '2 Hours', price: '₹3,000' }, { label: '4 Hours', price: '₹6,000' }, { label: '8 Hours', price: '₹12,000' }], extra: '₹1,500', features: ['1 Professional Camera', '3 Wall Studio Setup', 'Makeup & Dressing Room', 'WiFi & Power Backup', 'Cafeteria Access', ' Soundproof Room'] },
      { id: '02', name: '2 Camera Setup', tiers: [{ label: '2 Hours', price: '₹4,200' }, { label: '4 Hours', price: '₹8,400' }, { label: '8 Hours', price: '₹16,800' }], extra: '₹2,100', features: ['2 Professional Cameras', 'Multi-Angle Coverage', '3 Wall Studio Setup', 'Makeup & Dressing Room', 'WiFi & Power Backup', 'Cafeteria Access', ' Soundproof Room'] },
      { id: '03', name: '3 Camera Setup', tiers: [{ label: '2 Hours', price: '₹5,400' }, { label: '4 Hours', price: '₹10,800' }, { label: '8 Hours', price: '₹21,600' }], extra: '₹2,700', features: ['3 Professional Cameras', 'Full Multi-Angle Coverage', '3 Wall Studio Setup', 'Makeup & Dressing Room', 'WiFi & Power Backup', 'Cafeteria Access', 'Soundproof Room'], badge: 'Pro Package' }
    ]
  }

  return (
    <>
      <Navbar />
      <section className="studios-section">
        <div className="studios-hero">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} className="studios-tag">
            600 Sq.ft. Studio — Photo & Video Pricing
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            Studio<br /><span>Packages</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ delay: 0.2 }} className="studios-sub">
            600 sq.ft. professional studio - 3 wall setup, no green mat available for this Studio packages.<br />
            Without production, with 1-3 camera production.
          </motion.p>
        </div>

        <div className="studios-tabs">
          {[{ key: 'a', label: 'Without Production' }, { key: 'b', label: 'With Production' }].map(tab => (
            <div key={tab.key} className={`studios-tab ${activePart === tab.key ? 'active' : ''}`} onClick={() => setActivePart(tab.key)}>
              <span className="tab-letter">{tab.key.toUpperCase()}</span>
              <span className="tab-label">{tab.label}</span>
            </div>
          ))}
        </div>

        <div className="studios-grid">
          {packages[activePart].map((pkg, index) => (
            <motion.div
              key={pkg.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`studios-card ${pkg.tiers ? 'with-production' : 'without-production'}`}
            >
              <div className="card-number">{pkg.id}</div>
              <h3 className="card-name">{pkg.name}</h3>
              {pkg.target && <div className="card-target">{pkg.target}</div>}
              {pkg.tiers ? (
                <>
                  <div className="card-extra">Extra Hour — {pkg.extra}</div>
                  <div className="pricing-tiers">
                    {pkg.tiers.map((tier, i) => (
                      <div key={i} className="tier-item">
                        <span className="tier-label">{tier.label}</span>
                        <span className="tier-price">{tier.price} <span className="tier-gst">+GST</span></span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <div className="card-meta">
                    <div><span className="meta-label">Duration</span><span className="meta-value">{pkg.duration}</span></div>
                    <div><span className="meta-label">Investment</span><span className="meta-price">{pkg.price} <span className="meta-gst-inline">+GST</span></span></div>
                  </div>
                  <div className="gst-note">Extra Hour {pkg.extra}</div>
                </>
              )}
              <ul className="features">
                {pkg.features.map((feature, i) => (
                  <li key={i} className={i < 2 || whiteFeatures.has(feature.trim()) ? 'highlight' : ''}>{feature}</li>
                ))}
              </ul>
              {pkg.badge && <span className="delivery-badge">{pkg.badge}</span>}
              <span className="delivery-badge">Delivery: 7 Days</span>
              <Link className="enquiry-btn" to="/book" state={{ package: { id: pkg.id || pkg.name, name: pkg.name, duration: pkg.duration || 'Custom', price: parseInt(String(pkg.price || (pkg.tiers && pkg.tiers[0]?.price) || '0').replace(/,/g, '').match(/\\d+/)?.[0] || '0', 10), features: pkg.features || [] } }}>
                BOOK NOW
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="note-strip">
          <div className="note-icon">!</div>
          Bring your own storage device to copy the data · All prices + GST · Sessions by appointment only
        </div>

        <InstagramTail />
      </section>
      <ContactForm />
    </>
  )
}
