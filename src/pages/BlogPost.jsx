import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ContactForm from '../components/ContactForm';
import './Blog.css';

const BlogPost = () => {
  return (
    <>
      <main className="blog-section">
        <Navbar />
        <div className="blog-container">
        <Link to="/blog" className="blog-back-link">← Back to Blog</Link>
        
        <article className="blog-content">
          <h1 className="blog-title">Podcast Recording Studio in Rajajinagar, Bengaluru: Full Setup Guide + Rental Costs</h1>
          
          <p>
            If you've been searching for a <strong>podcast recording studio in Rajajinagar, Bengaluru</strong>, you've probably run into the same problem everyone does: either the space looks great but has zero information on pricing, or the pricing is there but you have no idea what you're actually walking into. This guide fixes that. Below is a complete breakdown of studio setups, what's included, and exactly what you'll pay — no hidden line items, no "contact us for a quote."
          </p>
          <p>
            Nearby Studio, based in Rajajinagar, offers professional podcast recording spaces built for everyone from first-time creators to corporate teams shooting brand shows. Here's everything on offer.
          </p>

          <h2>Why Rajajinagar Is a Smart Base for a Podcast Studio</h2>
          <p>
            Rajajinagar sits well-connected to central and west Bengaluru, making it an easy commute whether you're coming from Malleshwaram, Vijayanagar, Yeshwanthpur, or the CBD. For founders and creators who need a <strong>soundproof, camera-ready setup without driving across the city</strong>, that location matters more than it seems — especially when your guest list includes people with tight schedules.
          </p>

          <h2>What's Included in Every Setup</h2>
          <p>Regardless of package, every booking at Nearby Studio gives you:</p>
          <ul>
            <li>Fully soundproofed recording room</li>
            <li>AC studio access</li>
            <li>Premium sofa/seating arrangements</li>
            <li>Makeup and dressing room access</li>
            <li>Appointment-based scheduling (no walk-ins, so your slot is yours alone)</li>
          </ul>
          <p>
            All prices below are <strong>exclusive of GST</strong>, and sessions run strictly by prior appointment.
          </p>

          <h2>Podcast Studio Packages & Pricing</h2>

          <h3>A. Custom Setup — For Anyone Who Wants Control</h3>
          <div className="blog-package">
            <span className="blog-package-price">₹3,499 | 2 hours</span>
            <span className="blog-package-desc">Best for creators who already have their own recording plan and just need the room. Includes AC studio access, premium sofas, makeup/dressing room, and the soundproof recording space — you bring the rest.</span>
          </div>

          <h3>B. Founders & Startup Owners</h3>
          <p>Built for founders who want polished, ready-to-post content without a full production crew.</p>
          <ul>
            <li>
              <span className="blog-package-title">The Founders Room – 1</span>
              <span className="blog-package-price">₹14,999 | 2.5 hrs</span>
              <span className="blog-package-desc">1 camera setup, 40-minute podcast, 3 edited reels, basic colour correction and editing, 2 collar mics.</span>
            </li>
            <li>
              <span className="blog-package-title">The Founders Room – 2</span>
              <span className="blog-package-price">₹24,999 | 2.5 hrs</span>
              <span className="blog-package-desc">3 camera setup with podcast switcher, 5 edited reels, 30–40 minute podcast, 2 collar mics — a stronger multi-angle package for founders who post podcast clips regularly.</span>
            </li>
          </ul>

          <h3>C. Corporate Heads</h3>
          <p>For leadership teams and business conversations that need a more formal, multi-guest setup.</p>
          <ul>
            <li>
              <span className="blog-package-title">Round Table Conference</span>
              <span className="blog-package-price">₹44,999 | 2.5 hrs</span>
              <span className="blog-package-desc">Up to 4 guests, 3 camera setup, premium lighting, 4 collar mics, 4 reels, 40–60 minute podcast. Ideal for panel-style corporate discussions.</span>
            </li>
            <li>
              <span className="blog-package-title">Organic Podcast Setup</span>
              <span className="blog-package-price">₹34,999 | 2.5 hrs</span>
              <span className="blog-package-desc">2 people on an organic sofa arrangement, 3 camera setup, premium lighting, 2 collar mics, 4 reels, 1.5-hour podcast — built for a relaxed, conversational tone.</span>
            </li>
            <li>
              <span className="blog-package-title">Pitch Podcast Setup</span>
              <span className="blog-package-price">₹34,999 | 2.5 hrs</span>
              <span className="blog-package-desc">2 people on individual sofas, 3 camera setup, premium lighting, 2 collar mics, 4 reels, 1.5-hour podcast — a slightly more formal seating arrangement, well suited to interview or pitch-style formats.</span>
            </li>
          </ul>

          <h3>D. Influencers & Content Creators</h3>
          <p>For creators whose podcast doubles as short-form content fuel.</p>
          <ul>
            <li>
              <span className="blog-package-title">The Social Podcast – 1</span>
              <span className="blog-package-price">₹24,999 | 2.5 hrs</span>
              <span className="blog-package-desc">1 camera setup, 40-minute podcast, 3 edited reels, basic colour correction, 2 collar mics.</span>
            </li>
            <li>
              <span className="blog-package-title">The Social Podcast – 2</span>
              <span className="blog-package-price">₹34,999 | 2.5 hrs</span>
              <span className="blog-package-desc">3 camera setup with podcast switcher, 5 edited reels, 30–40 minute podcast, 2 collar mics.</span>
            </li>
          </ul>

          <h3>E. Brand Show</h3>
          <p>For brands building a signature, recurring show format.</p>
          <ul>
            <li>
              <span className="blog-package-title">Your Coffee Show</span>
              <span className="blog-package-price">₹54,999 | 2.5 hrs</span>
              <span className="blog-package-desc">2–3 guests, coffee table setup, 3 camera setup, premium lighting, 2–3 collar mics, 4 reels, 40–60 minute show. The most production-heavy package — meant for brands treating the podcast as an ongoing content series, not a one-off.</span>
            </li>
          </ul>

          <h2>How to Pick the Right Package</h2>
          <ul>
            <li><strong>Just testing the waters?</strong> Start with the Custom Setup — lowest commitment, full studio access.</li>
            <li><strong>Solo founder building a personal brand?</strong> The Founders Room – 1 or 2, depending on how many camera angles and reels you need.</li>
            <li><strong>Multi-guest business conversation?</strong> Round Table Conference or Organic/Pitch Podcast Setup, depending on how formal you want the tone.</li>
            <li><strong>Already have an audience and post reels weekly?</strong> The Social Podcast packages are built for that cadence.</li>
            <li><strong>Running a recurring brand show?</strong> Your Coffee Show is designed specifically for that.</li>
          </ul>

          <h2>Booking a Slot</h2>
          <p>
            All sessions at Nearby Studio, Rajajinagar are by appointment only — availability isn't first-come-first-served, so it's worth locking in your date ahead of any launch or campaign timeline. Reach out directly to check open slots and confirm your package.
          </p>

          <hr className="blog-divider" />
          
          <p className="blog-footer">
            Nearby Studio is a creative production vertical of Sripada Studios Pvt. Ltd., Bengaluru.
          </p>
        </article>
      </div>
    </main>
      <ContactForm />
    </>
  );
};

export default BlogPost;
