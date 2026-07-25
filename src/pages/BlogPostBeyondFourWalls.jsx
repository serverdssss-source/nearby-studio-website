import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ContactForm from '../components/ContactForm';
import './Blog.css';

const BlogPostBeyondFourWalls = () => {
  return (
    <>
      <main className="blog-section">
        <Navbar />
        <div className="blog-container">
        <Link to="/blog" className="blog-back-link">← Back to Blog</Link>
        
        <article className="blog-content">
          <h1 className="blog-title">Beyond Four Walls: How Nearby Studio Fits Into the Sripada Studios Ecosystem</h1>
          
          <p>
            Book a room, bring your gear, shoot, leave — that's how most people think about studio rentals. It's also where most studios stop. Nearby Studio was built differently: not as a standalone rental space, but as one piece of a larger creative ecosystem under <strong>Sripada Studios Pvt. Ltd.</strong>, a Bengaluru-based creative conglomerate built on originality, bold thinking, and service-oriented execution.
          </p>
          <p>
            Here's what that actually means for anyone booking a session — and why it matters beyond just getting a room for a few hours.
          </p>

          <h2>More Than a Room: A Production Mindset</h2>
          <p>
            A lot of studio spaces are, functionally, real estate — four walls, some lights, and a booking calendar. Nearby Studio operates with a different starting point: every space, package, and setup is built around <strong>actual production needs</strong>, not just square footage. That's a direct result of sitting inside a group that thinks about content strategy, brand-building, and production quality as its core business — not as an afterthought to renting out a room.
          </p>

          <h2>Part of a Wider Creative Network</h2>
          <p>
            Being a vertical within Sripada Studios means Nearby Studio isn't operating in isolation. The broader ecosystem includes teams and capabilities spanning digital marketing and content strategy, entertainment and regional media production, and brand storytelling — meaning the studio itself benefits from production standards, creative sensibility, and industry relationships that a purely rental-focused business wouldn't have access to.
          </p>
          <p>
            In practice, this shows up in details that are easy to overlook until you compare against a generic rental space: package structures that map to actual content formats (not just "hourly room rate"), lighting and camera setups designed with editing and deliverables in mind, and a sense of what makes content perform — not just what looks fine in the room.
          </p>

          <h2>Why This Matters If You're Booking</h2>
          <p>
            For a creator or brand deciding where to shoot, this distinction isn't just brand trivia — it changes what you can expect from the session itself:
          </p>
          <ul>
            <li><strong>Packages are built around outcomes</strong>, not just time slots — a "Founders Room" booking isn't just camera access, it's structured around what a founder actually needs to walk out with (edited reels, a usable podcast episode, not just raw footage).</li>
            <li><strong>The space is designed with production, not just photography, in mind</strong> — soundproofing, multi-camera setups, and switchers exist because the ecosystem behind Nearby Studio thinks in terms of finished content, not just a nice-looking room.</li>
            <li><strong>There's a broader understanding of what makes content work</strong>, informed by a group that's been producing media and brand content across multiple verticals — not a studio operator learning production from scratch.</li>
          </ul>

          <h2>The Bigger Picture</h2>
          <p>
            Renting a studio is usually treated as a logistics decision — find a space, book a slot, show up. Nearby Studio treats it as a production decision instead: the room, the equipment, and the package structure all exist to help you walk out with something genuinely usable, not just footage you still have to figure out what to do with.
          </p>
          <p>
            That's the difference between a room with lights in it, and a studio built by people whose actual business is creative production.
          </p>

          <hr className="blog-divider" />
          
          <p className="blog-footer">
            <em>Nearby Studio is a creative production vertical of Sripada Studios Pvt. Ltd., Bengaluru.</em>
          </p>
        </article>
      </div>
    </main>
      <ContactForm />
    </>
  );
};

export default BlogPostBeyondFourWalls;
