import React, { useState } from 'react';
import { faqSchema } from '../utils/seoConfig';
import './FAQ.css';

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = faqSchema.mainEntity;

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="faq-section">
      {/* Schema Markup */}
      <script type="application/ld+json">
        {JSON.stringify(faqSchema)}
      </script>

      <div className="faq-container">
        <div className="faq-header">
          <span className="faq-tag">FAQ</span>
          <h2 className="faq-title">
            Frequently Asked <span className="gradient-text">Questions</span>
          </h2>
          <p className="faq-subtitle">
            Everything you need to know about studio rental in Bengaluru
          </p>
        </div>

        <div className="faq-list">
          {faqs.map((faq, index) => (
            <div 
              key={index} 
              className={`faq-item ${openIndex === index ? 'active' : ''}`}
            >
              <button
                className="faq-question"
                onClick={() => toggleFAQ(index)}
                aria-expanded={openIndex === index}
              >
                <span>{faq.name}</span>
                <svg
                  className="faq-icon"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
              <div className="faq-answer">
                <p>{faq.acceptedAnswer.text}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="faq-cta">
          <p>Still have questions?</p>
          <a href="/contact" className="faq-contact-btn">
            Contact Us
          </a>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
