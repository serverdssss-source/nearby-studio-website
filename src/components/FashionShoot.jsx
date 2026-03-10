import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import Navbar from './Navbar'
import ContactForm from './ContactForm'
import InstagramTail from './Instagram_tail'
import './FashionShoot.css'

export default function FashionShoot() {
  const plans = [
    {
      id: '01',
      tag: 'Plan A',
      name: 'Half Day',
      target: '4 Hours · AC Indoor Studio Setup',
      duration: '4 hrs',
      price: '₹12,000 – ₹18,000',
      features: [
        { text: '1 Cameraman + Camera', highlight: true },
        { text: '15–25 Edited Images Inclusive', highlight: true },
        { text: 'Edited + Original Photos', highlight: true },
        { text: 'Own Costume (Up to 2)', highlight: true },
        { text: 'AC Studio Indoor Setup', highlight: true },
        { text: 'Makeup Room & Dressing Room', highlight: true }
      ]
    },
    {
      id: '02',
      tag: 'Plan B',
      name: 'Full Day',
      target: '8 Hours · AC Indoor Studio Setup',
      duration: '8 hrs',
      price: '₹20,000 – ₹30,000',
      features: [
        { text: '1 Cameraman + Camera', highlight: true },
        { text: '30–40 Edited Images Inclusive', highlight: true },
        { text: 'Edited + Original Photos', highlight: true },
        { text: 'Own Costume (Up to 4)', highlight: true },
        { text: 'AC Studio Indoor Setup', highlight: true },
        { text: 'Makeup Room & Dressing Room', highlight: true },
        { text: 'Shoot Guidance with Catalogue for Poses', highlight: true }
      ],
      badge: 'Best Value — Full Day'
    }
  ]

  return (
    <>
      <Navbar />
      <section className="fashion-section">
        <div className="fashion-hero">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="fashion-tag"
          >
            Model Shoot — Pricing 2026
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            Model Shoot<br /><span>Packages</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="fashion-sub"
          >
            Professional model photography for brands, designers & e-commerce.<br /> Half day and full day packages with 1 cameraman, edited images, and complete studio access. All prices + GST.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="who-banner"
        >
          <span className="who-label">Who?</span>
          <span className="who-value">Model Shoot — Brands / Designers / E-commerce</span>
        </motion.div>

        <div className="fashion-grid">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="fashion-card"
            >
              <div className="card-number">{plan.id}</div>
              <span className={`plan-tag ${plan.tag === 'Plan A' ? 'tag-a' : 'tag-b'}`}>{plan.tag}</span>
              <div className="card-set">Fashion Shoot</div>
              <h3 className="card-name">{plan.name}</h3>
              <div className="card-target">{plan.target}</div>
              <div className="card-meta">
                <div>
                  <span className="meta-label">Duration</span>
                  <span className="meta-value">{plan.duration}</span>
                </div>
                <div>
                  <span className="meta-label">Investment</span>
                  <span className="meta-price">{plan.price} <span className="meta-gst-inline">+GST</span></span>
                </div>
              </div>
              <div className="section-divider">
                <span className="divider-label">Includes</span>
                <span className="divider-line"></span>
              </div>
              <ul className="features">
                {plan.features.map((feature, i) => (
                  <li key={i} className={feature.highlight ? 'highlight' : ''}>{feature.text}</li>
                ))}
              </ul>
              {plan.badge && <span className="delivery-badge">{plan.badge}</span>}
              <span className="delivery-badge">Delivery: 7 Days</span>
              <Link
                className="enquiry-btn"
                to="/book"
                state={{ package: { id: plan.id || plan.name, name: plan.name, duration: plan.duration || 'Custom', price: parseInt(String(plan.price || '0').replace(/,/g, '').match(/\\d+/)?.[0] || '0', 10), features: plan.features ? plan.features.map(f => f.text) : [] } }}
              >
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
