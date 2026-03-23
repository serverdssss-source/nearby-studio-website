import React, { memo } from 'react'
import './WhyStudio.css'

const WhyStudio = memo(() => {
  const features = [
    {
      title: 'Professional Workflow',
      description: 'Optimized lighting, power, and rigging to reduce setup time.'
    },
    {
      title: 'Fast Turnarounds',
      description: 'Switch sets quickly and shoot multiple concepts in one day.'
    },
    {
      title: 'Acoustic Control',
      description: 'Engineered sound treatment for clean voice recordings.'
    },
    {
      title: 'End-to-End Support',
      description: 'On-site crew support from pre-production to wrap.'
    }
  ]

  const stats = [
    { value: '12 Hr', label: 'Access on request' },
    { value: '600', label: 'Sq.ft production floor' },
    { value: 'On-Site', label: 'Crew support' }
  ]

  return (
    <section className="why-premium-section">
      <div className="why-premium-container">
        <div className="why-premium-grid">
          <div className="why-premium-content">
            <span className="why-premium-tag">
              <span>Why</span>
              <span className="why-premium-tag-strong">nearbystudio</span>
            </span>

            <h2 className="why-premium-title">
              Production-First.
              <br />
              <span className="why-premium-gradient">Creator-Ready.</span>
            </h2>

            <p className="why-premium-description">
              A high-performance production space designed for speed, precision, and flexibility. Pre-lit rigs,
              tuned acoustics, adaptable sets, and a professional crew - everything built to move fast.
            </p>

            <div className="why-premium-buttons">
              <a
                href="#contact-form"
                className="why-premium-btn why-premium-btn-primary"
                onClick={(e) => {
                  e.preventDefault()
                  document.getElementById('contact-form')?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                  })
                }}
              >
                Book a Studio Tour
              </a>
            </div>
          </div>

          <div className="why-premium-features">
            {features.map((feature) => (
              <div className="why-premium-card" key={feature.title}>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="why-premium-stats">
          {stats.map((stat) => (
            <div className="why-premium-stat" key={stat.label}>
              <h3>{stat.value}</h3>
              <span>{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
})

WhyStudio.displayName = 'WhyStudio'

export default WhyStudio
