import React from 'react'
import { Link } from 'react-router-dom'
import Navbar from './Navbar'
import './ContactForm.css'

export default function ContactForm() {
  return (
    <>
      <section id="contact-form" className="contact-form-section">
        <div className="contact-container">
          <div className="left-column">
            <div className="contact-left">
              <h1>Let&apos;s work together.</h1>
              <p>
                Tell us about your project.
                <span className="mobile-line-break"> We&apos;ll get back to you within 24 hours.</span>
              </p>
            </div>

            <div className="contact-card">
              <div className="contact-item">
                <span className="label">EMAIL</span>
                <a href="mailto:photography@sripadastudios.in">photography@sripadastudios.in</a>
              </div>

              <div className="divider" />

              <div className="contact-item">
                <span className="label">PHONE</span>
                <a href="tel:+916366623955">+91 63666 23955</a>
              </div>

              <div className="divider" />

              <div className="contact-item">
                <span className="label">ADDRESS</span>
                <p>
                  No:4/2, 1st Chord Road
                  <br />
                  Rajajinagar Industrial Town
                  <br />
                  Bengaluru, Karnataka 560010
                </p>
              </div>
            </div>

            <div className="contact-social-wrap">
              <p className="contact-social-title">Connect With Us</p>
              <div className="contact-social" aria-label="Social links">
                <a href="https://www.instagram.com/nearbystudio_/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2Zm0 1.5A4.25 4.25 0 0 0 3.5 7.75v8.5a4.25 4.25 0 0 0 4.25 4.25h8.5a4.25 4.25 0 0 0 4.25-4.25v-8.5a4.25 4.25 0 0 0-4.25-4.25h-8.5Zm8.9 2.2a1.05 1.05 0 1 1 0 2.1 1.05 1.05 0 0 1 0-2.1ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 1.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z" />
                  </svg>
                </a>
                <a href="https://www.facebook.com/nearbystudioofficial/" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M13.5 22v-8h2.9l.45-3.5H13.5V8.35c0-1.02.29-1.72 1.76-1.72H17V3.45c-.3-.04-1.32-.13-2.52-.13-2.5 0-4.22 1.53-4.22 4.35V10.5H7.5V14h2.76v8h3.24Z" />
                  </svg>
                </a>
                <a href="https://www.youtube.com/@nearbystudioofficial" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M21.6 7.2a2.95 2.95 0 0 0-2.08-2.08C17.68 4.6 12 4.6 12 4.6s-5.68 0-7.52.52A2.95 2.95 0 0 0 2.4 7.2 30.2 30.2 0 0 0 2 12a30.2 30.2 0 0 0 .4 4.8 2.95 2.95 0 0 0 2.08 2.08c1.84.52 7.52.52 7.52.52s5.68 0 7.52-.52a2.95 2.95 0 0 0 2.08-2.08A30.2 30.2 0 0 0 22 12a30.2 30.2 0 0 0-.4-4.8ZM10.2 15.05V8.95L15.45 12l-5.25 3.05Z" />
                  </svg>
                </a>
              </div>
            </div>

          </div>

          <div className="contact-form-wrapper">
            <form className="contact-form">
              <div className="form-group">
                <label htmlFor="name">Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  placeholder="Your full name"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Enter your email address"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="service">Service</label>
                <select
                  id="service"
                  name="service"
                  required
                >
                  <option value="">Choose a service</option>
                  <option value="studios">Studio Rental</option>
                  <option value="podcast">Podcast Shoot</option>
                  <option value="fashion-shoot">Fashion Shoot</option>
                  <option value="fashion-shoot">Green Screen Shoot</option>
                  <option value="product-shoot">Other Inquiry</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="message">Message</label>
                <textarea
                  id="message"
                  name="message"
                  rows="5"
                  placeholder="Tell us about your project..."
                  required
                />
              </div>

              <button type="submit" className="submit-button">
                Send Message
              </button>
            </form>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-bar">
            <p className="footer-credits">© 2026 All rights reserved by{' '}
              <a
                href="https://www.nearbystudio.in/"
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => {
                  e.preventDefault()
                  window.open('https://www.nearbystudio.in/', '_blank', 'noopener,noreferrer')
                }}
              >
                nearby studio
              </a>
              <span className="footer-owner-line">
                {' '}| Developed & Owned by{' '}
                <a href="https://sripadastudios.com/" target="_blank" rel="noopener noreferrer">
                  Sripada Studios
                </a>
              </span>
            </p>
            <div className="footer-nav-group">
              <div className="footer-navbar-wrap">
                <Navbar />
              </div>
              <Link 
                to="/privacy-policy" 
                className="footer-privacy-text"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              >
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}
