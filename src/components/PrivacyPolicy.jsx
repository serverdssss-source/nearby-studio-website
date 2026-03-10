import React from 'react'
import Navbar from './Navbar'
import ContactForm from './ContactForm'
import './PrivacyPolicy.css'

export default function PrivacyPolicy() {
  return (
    <>
      <Navbar />
      <div className="privacy-policy">
        <div className="privacy-container">
          <h1>Privacy Policy</h1>
          <p className="effective-date"><strong>Effective Date:</strong> March 6, 2026</p>
          
          <p className="intro">
            <strong>Sripada Studios PVT LTD</strong> ("we", "our", "us") respects your privacy and is committed to protecting the personal information you share with us. This Privacy Policy explains how we collect, use, disclose, and protect your information when you visit our website or use our services.
          </p>
          
          <p className="intro">By using our website, you agree to the terms of this Privacy Policy.</p>

          <section>
            <h2>1. Information We Collect</h2>
            <p>We may collect the following types of information:</p>
            
            <h3>Personal Information</h3>
            <p>Information that you voluntarily provide when you contact us, make a booking, or fill out forms on our website, including:</p>
            <ul>
              <li>Full name</li>
              <li>Email address</li>
              <li>Phone number</li>
              <li>Booking details or service inquiries</li>
              <li>Any information you choose to provide in communication with us</li>
            </ul>

            <h3>Automatically Collected Information</h3>
            <p>When you visit our website, certain information may be collected automatically, including:</p>
            <ul>
              <li>IP address</li>
              <li>Browser type</li>
              <li>Device information</li>
              <li>Pages visited and interaction data</li>
              <li>Referring website</li>
            </ul>
            <p>This information helps us understand how visitors use our website and improve our services.</p>
          </section>

          <section>
            <h2>2. How We Use Your Information</h2>
            <p>We use the information we collect for purposes including:</p>
            <ul>
              <li>Processing bookings and service requests</li>
              <li>Communicating with you regarding inquiries or bookings</li>
              <li>Providing customer support</li>
              <li>Improving our website and services</li>
              <li>Analyzing website performance and usage</li>
              <li>Sending updates or marketing communications where permitted by law</li>
            </ul>
          </section>

          <section>
            <h2>3. Cookies and Tracking Technologies</h2>
            <p>Our website may use <strong>cookies and similar technologies</strong> to improve user experience and analyze website traffic.</p>
            <p>Cookies help us:</p>
            <ul>
              <li>Remember user preferences</li>
              <li>Analyze website performance</li>
              <li>Improve website functionality</li>
            </ul>
            <p>You can disable cookies through your browser settings; however, some parts of the website may not function properly.</p>
          </section>

          <section>
            <h2>4. Third-Party Services</h2>
            <p>We may use trusted third-party services such as analytics providers to help us operate and improve our website.</p>
            <p>These third parties may collect certain information in accordance with their own privacy policies.</p>
            <p>We do not sell or rent your personal information to third parties.</p>
          </section>

          <section>
            <h2>5. Data Security</h2>
            <p>We take reasonable technical and organizational measures to protect your personal information from unauthorized access, disclosure, alteration, or destruction.</p>
            <p>However, no internet transmission or electronic storage method is completely secure.</p>
          </section>

          <section>
            <h2>6. Data Retention</h2>
            <p>We retain personal information only for as long as necessary to:</p>
            <ul>
              <li>Provide our services</li>
              <li>Maintain business records</li>
              <li>Comply with applicable legal obligations</li>
            </ul>
          </section>

          <section>
            <h2>7. Your Rights</h2>
            <p>Depending on applicable laws, you may have the right to:</p>
            <ul>
              <li>Request access to your personal information</li>
              <li>Request correction of inaccurate information</li>
              <li>Request deletion of your personal data</li>
              <li>Withdraw consent for marketing communications</li>
            </ul>
            <p>To exercise these rights, please contact us using the details below.</p>
          </section>

          <section>
            <h2>8. Updates to This Policy</h2>
            <p>We may update this Privacy Policy from time to time to reflect changes in our practices, technology, or legal requirements. Updated versions will be posted on this page with the revised effective date.</p>
          </section>

          <section>
            <h2>9. Contact Us</h2>
            <p>If you have questions about this Privacy Policy or how we handle your information, please contact us:</p>
            <p><strong>Sripada Studios PVT LTD</strong></p>
            <p>Email: <a href="mailto:photography@sripadastudios.in">photography@sripadastudios.in</a></p>
          </section>
        </div>
      </div>
      <ContactForm />
    </>
  )
}
