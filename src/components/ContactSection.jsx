import React from 'react'
import { motion } from 'framer-motion'
import './ContactSection.css'

export default function ContactSection() {
  return (
    <section className="contact-section">
      {/* Background Radial Gradient */}
      <div className="contact-gradient" />

      {/* Top Ghost Text - Scrolling Left */}
      <div className="ghost-text ghost-text-top">
        <h2 data-text="Brands • Agencies • Startups • Hospitality • Education • Product Companies • Film Teams • Personal Brands • Brands • Agencies • Startups • Hospitality • Education • Product Companies • Film Teams • Personal Brands • Brands • Agencies • Startups • Hospitality • Education • Product Companies • Film Teams • Personal Brands • ">
          Brands • Agencies • Startups • Hospitality • Education • Product Companies • Film Teams • Personal Brands • Brands • Agencies • Startups • Hospitality • Education • Product Companies • Film Teams • Personal Brands • Brands • Agencies • Startups • Hospitality • Education • Product Companies • Film Teams • Personal Brands •
        </h2>
      </div>

      {/* Content Container */}
      <div className="contact-content">
        {/* Label */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="contact-label"
        >
          <span className="label-line" />
          <span className="label-text">Booking / Contact</span>
        </motion.div>

        {/* Main Heading */}
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="contact-heading"
        >
          Ready to shoot at <br />
          <span className="highlight">Nearby Studio</span> <i className="italic-text">Let's Connect</i>
        </motion.h2>

        {/* Subtext */}
        <motion.p 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="contact-subtext"
        >
          Share your shoot date, duration, and requirements. <br />We'll confirm availability and send the best-fit package.
        </motion.p>

        {/* The CTA Button */}
        <motion.a
          href="#contact-form"
          onClick={(e) => {
            e.preventDefault()
            document.getElementById('contact-form')?.scrollIntoView({ 
              behavior: 'smooth',
              block: 'start'
            })
          }}
          className="cta-button"
        >
          <span className="cta-button-text">Let's Work Together</span>
          <span className="arrow-icon" aria-hidden="true" />
        </motion.a>
      </div>

      {/* Bottom Ghost Text - Scrolling Right */}
      <div className="ghost-text ghost-text-bottom">
        <h2 data-text="Let's work together • Let's work together • Let's work together • Let's work together • Let's work together • Let's work together • Let's work together • Let's work together • Let's work together • ">
          Let's work together • Let's work together • Let's work together • Let's work together • Let's work together • Let's work together • Let's work together • Let's work together • Let's work together •
        </h2>
      </div>
    </section>
  )
}
