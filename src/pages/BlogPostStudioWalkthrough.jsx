import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ContactForm from '../components/ContactForm';
import SEO from '../components/SEO';
import BlogImage from '../components/BlogImage';
import './Blog.css';

const BlogPostStudioWalkthrough = () => {
  return (
    <>
      <SEO
        title="What's Inside Nearby Studio, Rajajinagar: A Walkthrough of Every Setup | Nearby Studio"
        description="A setup-by-setup walkthrough of Nearby Studio in Rajajinagar, Bengaluru: soundproofed podcast rooms, the fashion and product shoot setup, the green screen room, and the gear in every session."
        type="article"
        ogImage="/book_our_show/podcast/custom_setup_2.webp"
      />
      <main className="blog-section">
        <Navbar />
        <div className="blog-container">
        <Link to="/blog" className="blog-back-link">← Back to Blog</Link>

        <article className="blog-content">
          <h1 className="blog-title">What's Inside Nearby Studio, Rajajinagar: A Walkthrough of Every Setup</h1>

          <BlogImage src="/book_our_show/podcast/custom_setup_2.webp" alt="Wide view of the podcast studio floor at Nearby Studio, Rajajinagar, with sofa seating, mics and overhead lights" width={1536} height={1024} priority />

          <p>
            Photos can only tell you so much about a studio. You can see a sofa and a backdrop, but you can't tell whether the room is actually quiet, whether the lights are built for video, or whether the setup you need exists at all. So here is a plain walkthrough of what's inside Nearby Studio in Rajajinagar, Bengaluru, setup by setup, and who each one is built for.
          </p>

          <h2>The Podcast Setups</h2>

          <BlogImage src="/book_our_show/corporate heads/round_table.webp" alt="Round table podcast setup for up to four guests at Nearby Studio" width={1536} height={1024} />
          <p>
            This is the part of the studio most people book first. The podcast rooms are fully soundproofed and air-conditioned, so a long conversation never gets interrupted by traffic or echo. Every guest gets their own collar mic, and the video packages run on three cameras with a podcast switcher, which is what lets the edit cut between speakers the way a produced show does.
          </p>
          <p>
            The seating changes with the format:
          </p>
          <ul>
            <li><strong>Sofa setups for two</strong> suit relaxed interviews. The Organic Podcast Setup puts both people on one sofa, while the Pitch Podcast Setup gives each their own seat for a slightly more formal frame.</li>
            <li><strong>The Round Table</strong> seats up to four guests, built for panel discussions and leadership conversations.</li>
            <li><strong>The Coffee Show set</strong> puts two to three guests around a coffee table, designed for brands that want a recurring show.</li>
            <li><strong>The Founders Room and Social Podcast setups</strong> are the lighter packages, starting with a single camera for people recording their first episodes.</li>
          </ul>
          <p>
            Prices and what each package includes are on the <Link to="/podcast">podcast studio page</Link>.
          </p>

          <h2>The Fashion and Product Shoot Setup</h2>

          <BlogImage src="/book_our_show/founder/founders_room_1.webp" alt="Warmly lit studio set at Nearby Studio, Rajajinagar, with two armchairs, a table and microphones" width={1537} height={1023} />
          <p>
            For photography, the room works differently. There is space to move, so a model can walk and change positions and the photographer can shoot from different distances instead of being boxed into one corner. Lighting is adjustable, which matters because fashion needs softer, flattering light while product work needs tighter control over reflections and shadows. Backdrop systems let you switch looks quickly between setups.
          </p>
          <p>
            A dedicated makeup and dressing room sits alongside, so outfit changes and touch-ups don't eat into the session. Details and booking for this are on the <Link to="/fashionshoot">fashion shoot page</Link>.
          </p>

          <h2>The Green Screen Room</h2>

          <BlogImage src="/Snapshots1/5.webp" alt="Man presenting to camera in front of an evenly lit green screen in Bengaluru" width={1080} height={1350} />
          <p>
            The green screen setup is its own space, lit evenly so there are no shadows or green spill on the subject, which is what makes clean compositing possible afterward. Creators use it to swap backdrops for reels, brands use it to place a product in different scenes without renting locations, and companies use it for webinars and training videos with a branded virtual background. More on the <Link to="/greenscreenshoot">green screen page</Link>.
          </p>

          <h2>The Gear That Runs Through Every Setup</h2>
          <p>
            A few things are in place no matter which setup you book:
          </p>
          <ul>
            <li>Multi-camera coverage and a podcast switcher</li>
            <li>Individual collar mics and soundproofing</li>
            <li>Premium, adjustable lighting, including enough lights for a proper three-point setup</li>
            <li>A teleprompter for scripted delivery</li>
            <li>Monitors for real-time playback, so you can check framing and audio before you leave rather than after</li>
            <li>AC studio access and premium sofas</li>
            <li>The makeup and dressing room</li>
          </ul>

          <h2>How a Session Works</h2>
          <p>
            Every session at Nearby Studio runs by appointment, so the room is yours for the full slot. You tell us what you're shooting and how many people are involved, we recommend the right setup, and you show up to a room that's already lit and tested. The paid packages run 2.5 hours, and the Custom Setup, for people who only want the room, runs 2 hours.
          </p>

          <h2>Where to Find Us</h2>
          <p>
            Nearby Studio is in Rajajinagar, Bengaluru, an easy trip from Malleshwaram, Yeshwanthpur, Vijayanagar and the rest of West and Central Bengaluru. If you'd like to see the setups yourself before booking, you're welcome to visit.
          </p>
          <p>
            Send us your concept, even a rough one, along with your preferred date and the number of guests, and we'll confirm the right setup and hold your slot.
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

export default BlogPostStudioWalkthrough;
