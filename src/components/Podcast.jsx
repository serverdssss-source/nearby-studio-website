import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import Navbar from './Navbar'
import ContactForm from './ContactForm'
import InstagramTail from './Instagram_tail'
import './Podcast.css'

export default function Podcast() {
  const [activePart, setActivePart] = useState('a')

  const setupImages = [
    {
      src: encodeURI('/ImageGallery/Brown_Setup_1 1.webp'),
      alt: 'Brown podcast setup with two chairs and microphones'
    },
    {
      src: encodeURI('/ImageGallery/Brown_Setup_1 3.webp'),
      alt: 'Blue podcast setup with microphones and curtains'
    },
    {
      src: encodeURI('/ImageGallery/Brown_Setup_1 5.webp'),
      alt: 'Brown sofa podcast setup with studio lighting'
    }
  ]

  const packages = {
    a: [
      {
        id: '00',
        name: 'Custom Setup',
        set: 'Beginner',
        target: 'All Audiences • You Decide',
        duration: '2 hrs',
        price: '₹3,499',
        features: ['AC Studio access', 'Premium sofas', 'Makeup & Dressing Room', 'Soundproof Room'],
        custom: true
      },
      {
        id: '01',
        name: 'The Founders Room - 1',
        set: 'Set 1 — Part A',
        target: 'Founders & Startup Owners',
        duration: '2.5 hrs',
        price: '₹14,999',
        features: ['1 Camera Setup', '40 min podcast', '3 Reels edited', 'Basic colour correction, graphics & editing', 'Basic inserts • 1 Iteration', '2 Collar Mics', '2 Rotation Chairs', '1 White Table', '1 Sofa • Tea Table • Plain Frame']
      },
      {
        id: '02',
        name: 'Round Table Conference',
        set: 'Set 2 — Part A',
        target: 'Corporate Heads',
        duration: '2.5 hrs',
        price: '₹44,999',
        features: ['Up to 4 Guests', '1 Round Table', '4 Rotating Chairs', '3 Camera Setup', 'Premium lighting • 4 Collar Mics', '4 Reels <90 sec each • 1 Hook Teaser', '40–60 min Podcast • Podcast Switcher', '1 Iteration'],
        delivery: '7 Days'
      },
      {
        id: '03',
        name: 'The Social Podcast — 1',
        set: 'Set 3 — Part A',
        target: 'Influencers & Content Creators',
        duration: '2.5 hrs',
        price: '₹24,999',
        features: ['1 Camera Setup', '40 min podcast', '3 Reels edited', 'Basic colour correction, graphics & editing', 'Basic inserts • 1 Iteration', '2 Collar Mics', '2 Rotation Chairs • White Table', '1 Sofa • Tea Table • Plain Frame']
      },
      {
        id: '04',
        name: 'Your Coffee Show',
        set: 'Set 4 — Part A',
        target: 'Brands',
        duration: '2.5 hrs',
        price: '₹54,999',
        features: ['2–3 Guests', 'Coffee Table Setup', 'Floor Mat • Logo Placement • Artificial Props', '2-Seater Sofa + Premium Chair', '3 Camera Setup', 'Premium Lighting', '2–3 Collar Mics', '4 Reels <90 sec each + 1 Hook Teaser', '40–60 min Show + Podcast Switcher', '1 Iteration'],
        delivery: '7 Days'
      }
    ],
    b: [
      {
        id: '05',
        name: 'The Founders Room - 2',
        set: 'Set 5 — Part B',
        target: 'Founders & Startup Owners',
        duration: '2.5 hrs',
        price: '₹24,999',
        features: ['3 Camera Setup', 'Podcast Switcher', '5 Reels <90 sec each', '30–40 min Podcast (up to 1 hr)', 'Basic colour correction, graphics & editing', 'Basic inserts • 1 Iteration', '2 Collar Mics', '2 Rotation Chairs • Sofa', '1 White Table']
      },
      {
        id: '06',
        name: 'Organic Podcast Setup',
        set: 'Set 6 — Part B',
        target: 'Corporate Series',
        duration: '2.5 hrs',
        price: '₹34,999',
        features: ['2 People on Organic Sofa', 'Coffee Table • Two Individual Sofas', '3 Camera Setup', 'Premium Lighting • 2 Collar Mics', '4 Reels <90 sec each', '1 Hook Teaser • 1.5 hr Podcast', 'Podcast Switcher • 1 Iteration'],
        delivery: '7 Days'
      },
      {
        id: '07',
        name: 'The Social Podcast — 2',
        set: 'Set 7 — Part B',
        target: 'Influencers & Content Creators',
        duration: '2.5 hrs',
        price: '₹34,999',
        features: ['3 Camera Setup', 'Podcast Switcher', '5 Reels <90 sec each', '30–40 min Podcast (up to 1 hr)', 'Basic colour correction, graphics & editing', 'Basic inserts • 1 Iteration', '2 Collar Mics', '2 Rotation Chairs • White Table • Sofa']
      }
    ],
    c: [
      {
        id: '08',
        name: 'Pitch Podcast Setup',
        set: 'Part C — Corporate Series',
        target: 'Corporate — 2 People',
        duration: '2.5 hrs',
        price: '₹34,999',
        features: ['2 People — Individual Sofas', '1 Coffee Table', '3 Camera Setup', 'Premium Lighting', '2 Collar Mics', '4 Reels <90 sec each', '1 Hook Teaser • 1.5 hr Podcast', 'Podcast Switcher • 1 Iteration'],
        delivery: '7 Days'
      }
    ]
  }

  const allPackages = [...packages.a, ...packages.b, ...packages.c]

  const tabConfig = [
    { key: 'a', label: 'Custom' },
    { key: 'b', label: 'Founders & Startup Owners' },
    { key: 'c', label: 'Corporates Heads' },
    { key: 'd', label: 'Influencers & Content Creators' },
    { key: 'e', label: 'Brand Show' }
  ]

  const filteredPackages = allPackages.filter((pkg) => {
    if (activePart === 'a') return pkg.custom
    if (activePart === 'b') return pkg.target.includes('Founders & Startup Owners')
    if (activePart === 'c') return pkg.target.includes('Corporate')
    if (activePart === 'd') return pkg.target.includes('Influencers & Content Creators')
    if (activePart === 'e') return pkg.target.includes('Brands')
    return false
  })

  return (
    <>
      <Navbar />
      <section className="podcast-section">
        <div className="podcast-hero">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="podcast-tag"
          >
            Podcast Studio — Pricing 2026
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 0 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            Podcast<br /><span>Packages</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="podcast-sub"
          >
            Professional podcast studio packages for founders, corporates, influencers, and brands. Pick your setup. Show up. Ship it.
          </motion.p>
        </div>

        <div className="section-tabs">
          {tabConfig.map((tab) => (
            <div
              key={tab.key}
              className={`section-tab ${activePart === tab.key ? 'active' : ''}`}
              onClick={() => setActivePart(tab.key)}
            >
              <span className="tab-letter">{tab.key.toUpperCase()}</span>
              <div className="tab-meta">
                <span className="tab-label">{tab.label}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="pricing-layout">
          <div className="packages-grid">
            {filteredPackages.map((pkg, index) => (
              <motion.div
                key={pkg.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`package-card ${pkg.custom ? 'custom' : ''}`}
              >
                <h3 className="card-name">{pkg.name}</h3>
                <div className="card-target">{pkg.target}</div>
                <div className="card-meta">
                  <div>
                    <span className="meta-label">Duration</span>
                    <span className="meta-value">{pkg.duration}</span>
                  </div>
                  <div>
                    <span className="meta-label">Investment</span>
                    <span className="meta-price">{pkg.price}</span>
                  </div>
                </div>
                <ul className="features">
                  {pkg.features.map((feature, i) => (
                    <li key={i}>{feature}</li>
                  ))}
                </ul>
                {pkg.custom && <span className="custom-badge">Fully Customisable</span>}
                <span className="delivery-badge">Delivery: 7 Days</span>
                <Link
                  className="enquiry-btn"
                  to="/book"
                  state={{ package: { id: pkg.id || pkg.name, name: pkg.name, duration: pkg.duration || 'Custom', price: parseInt(String(pkg.price || '0').replace(/,/g, '').match(/\\d+/)?.[0] || '0', 10), features: pkg.features || [] } }}
                >
                  BOOK NOW
                </Link>
              </motion.div>
            ))}
          </div>

          <aside className="setup-rail" aria-label="Podcast setup gallery">
            {setupImages.map((image, index) => (
              <motion.div
                key={image.src}
                initial={{ opacity: 0, x: 16 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.12 }}
                className="setup-image-card"
              >
                <img src={image.src} alt={image.alt} className="setup-image" loading="lazy" />
              </motion.div>
            ))}
          </aside>
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
