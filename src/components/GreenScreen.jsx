import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import Navbar from './Navbar'
import ContactForm from './ContactForm'
import InstagramTail from './Instagram_tail'
import './Studios.css'
import './GreenScreen.css'

export default function GreenScreen() {
  const packages = [
    {
      id: '01',
      name: 'Package 1',
      target: '9 AM to 6 PM',
      duration: '9AM - 6PM',
      price: '₹4,500',
      extra: '₹999',
      features: [
        '2 Ton AC',
        'Basic Lights Included',
        'Cafeteria Access',
        'WiFi',
        'Makeup Room',
        'Dressing Room',
        'Cloth Ironing',
        'Chairs & Stools (up to 4)',
        'Tutorial Table / Product Shoot Table',
        'Sound Proof'
      ]
    },
    {
      id: '02',
      name: 'Package 2',
      target: 'Full Day — 8 Hours',
      duration: '8 hrs',
      price: '₹9,999',
      extra: '₹999',
      features: [
        '2 Ton AC',
        'Basic Lights Included',
        'Cafeteria Access',
        'WiFi',
        'Makeup Room',
        'Dressing Room',
        'Cloth Ironing',
        'Chairs & Stools (up to 4)',
        'Tutorial Table / Product Shoot Table',
        'Sound Proof'
      ],
      badge: 'Best Value — Full Day'
    }
  ]

  return (
    <>
      <Navbar />
      <section className="studios-section greenscreen-section">
        <div className="studios-hero">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} className="studios-tag">
            Green Screen Studio — Pricing 2026
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            Green Screen<br /><span>Packages</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ delay: 0.2 }} className="studios-sub">
            Dedicated green screen setup for production shoots with full studio access.<br />
            All prices + GST · Sessions by appointment only
          </motion.p>
        </div>

        <div className="studios-grid greenscreen-grid">
          {packages.map((pkg, index) => (
            <motion.div
              key={pkg.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="studios-card"
            >
              <div className="card-number">{pkg.id}</div>
              <h3 className="card-name">{pkg.name}</h3>
              <div className="card-target">{pkg.target}</div>
              <div className="card-meta">
                <div><span className="meta-label">Duration</span><span className="meta-value">{pkg.duration}</span></div>
                <div><span className="meta-label">Investment</span><span className="meta-price">{pkg.price} <span className="meta-gst-inline">+GST</span></span></div>
              </div>
              <div className="gst-note">Extra Hour {pkg.extra}</div>
              <ul className="features">
                {pkg.features.map((feature, i) => (
                  <li key={i} className={i < 2 ? 'highlight' : ''}>{feature}</li>
                ))}
              </ul>
              {pkg.badge && <span className="delivery-badge">{pkg.badge}</span>}
              <span className="delivery-badge">Delivery: 7 Days</span>
              <Link className="enquiry-btn" to="/book" state={{ package: { id: pkg.id || pkg.name, name: pkg.name, duration: pkg.duration || 'Custom', price: parseInt(String(pkg.price || '0').replace(/,/g, '').match(/\\d+/)?.[0] || '0', 10), features: pkg.features || [] } }}>
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
