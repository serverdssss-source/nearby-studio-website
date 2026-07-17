import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ContactForm from '../components/ContactForm';
import './Blog.css';

const BlogList = () => {
  return (
    <>
      <main className="blog-section">
        <Navbar />
        <div className="blog-container" style={{ maxWidth: '1200px' }}>
        <h1 className="blog-title">Our Blog</h1>
        
        <div className="blog-list">
          <Link to="/blog/why-podcast-production-matters" className="blog-card">
            <div className="blog-card-content">
              <h2 className="blog-card-title">Why Podcast Production Actually Matters for Your Brand</h2>
              <p className="blog-card-excerpt">
                Most founders and business heads still file "podcast" under marketing — one more content format to hand off to the social media team. That's underselling it. A well-produced podcast does things a marketing calendar can't...
              </p>
              <div className="blog-card-meta">
                <span className="blog-card-date">July 17, 2026</span>
              </div>
              <div className="blog-card-author">
                <div className="blog-card-avatar">N</div>
                <span className="blog-card-author-name">Nearby Studio</span>
              </div>
            </div>
          </Link>
          <Link to="/blog/fashion-shoot-vs-product-shoot-rajajinagar" className="blog-card">
            <div className="blog-card-content">
              <h2 className="blog-card-title">Fashion Shoot vs. Product Shoot in Rajajinagar, Bengaluru: Do You Need a Different Studio Setup?</h2>
              <p className="blog-card-excerpt">
                If you're booking a studio in Rajajinagar, Bengaluru for the first time, this question trips up more people than you'd expect: is a fashion shoot setup and a product shoot setup actually different...
              </p>
              <div className="blog-card-meta">
                <span className="blog-card-date">July 17, 2026</span>
              </div>
              <div className="blog-card-author">
                <div className="blog-card-avatar">N</div>
                <span className="blog-card-author-name">Nearby Studio</span>
              </div>
            </div>
          </Link>
          <Link to="/blog/5-signs-youve-outgrown-shooting-content-at-home" className="blog-card">
            <div className="blog-card-content">
              <h2 className="blog-card-title">5 Signs You've Outgrown Shooting Content at Home (And Need a Studio)</h2>
              <p className="blog-card-excerpt">
                Every content creator starts the same way — a ring light, a corner of the living room, and whatever backdrop doesn't have laundry piled behind it. That's fine when you're posting for fun...
              </p>
              <div className="blog-card-meta">
                <span className="blog-card-date">July 16, 2026</span>
              </div>
              <div className="blog-card-author">
                <div className="blog-card-avatar">N</div>
                <span className="blog-card-author-name">Nearby Studio</span>
              </div>
            </div>
          </Link>

          <Link to="/blog/podcast-recording-studio-rajajinagar" className="blog-card">
            <div className="blog-card-content">
              <h2 className="blog-card-title">Podcast Recording Studio in Rajajinagar, Bengaluru: Full Setup Guide + Rental Costs</h2>
              <p className="blog-card-excerpt">
                If you've been searching for a podcast recording studio in Rajajinagar, Bengaluru, you've probably run into the same problem everyone does: either the space looks great but has zero information on pricing...
              </p>
              <div className="blog-card-meta">
                <span className="blog-card-date">July 16, 2026</span>
              </div>
              <div className="blog-card-author">
                <div className="blog-card-avatar">N</div>
                <span className="blog-card-author-name">Nearby Studio</span>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </main>
      <ContactForm />
    </>
  );
};

export default BlogList;
