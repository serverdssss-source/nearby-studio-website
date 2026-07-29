import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ContactForm from '../components/ContactForm';
import './Blog.css';

const BlogPostTop5PlacesRajajinagar = () => {
  return (
    <>
      <main className="blog-section">
        <Navbar />
        <div className="blog-container">
        <Link to="/blog" className="blog-back-link">← Back to Blog</Link>
        
        <article className="blog-content">
          <h1 className="blog-title">Top 5 Places to Visit Near Rajajinagar, Bengaluru</h1>
          
          <p>
            Rajajinagar doesn't get talked about as much as some of Bengaluru's flashier neighborhoods, but it packs in a surprising amount — heritage temples, a proper local food scene, malls, and even an indoor snow park, all within the same few kilometers. So whether you've got a shoot booked at Nearby Studio, a meeting nearby, or you're just in the area for a bit, here are five spots worth checking out close by.
          </p>

          <h2>1. ISKCON Temple, Rajajinagar</h2>
          <p>
            A large, striking temple complex dedicated to Lord Krishna, known for its detailed architecture, golden shrines, and calm atmosphere despite sitting right in the neighborhood. It's a quick, easy stop before or after a shoot, and the complex often hosts cultural events and festivals through the year — worth checking the calendar if you're around on the right day.
          </p>

          <h2>2. Orion Mall</h2>
          <p>
            One of Rajajinagar's most popular hangout spots, with a solid mix of shopping, dining, and entertainment — including a multiplex and a play zone for kids. If you've got downtime between shoot sessions or need a place to grab a proper meal nearby, this is the easiest option in the area.
          </p>

          <h2>3. Fun World & Snow City</h2>
          <p>
            Right in the neighborhood, this combo of an amusement park and India's first indoor snow park makes for a genuinely different way to spend a couple of hours — especially if you've got a shoot involving kids' content, or just want an offbeat break from a long production day.
          </p>

          <h2>4. World Trade Center, Brigade Gateway</h2>
          <p>
            A modern business and lifestyle hub within the Rajajinagar area, home to office spaces, a hotel, and retail options. Useful to know about if you're combining a shoot day with client meetings or need a business-friendly spot nearby.
          </p>

          <h2>5. Nearby Studio</h2>
          <p>
            Right in the middle of it all is Nearby Studio — a premium studio rental and creative production space built for podcasts, ad films, product and fashion shoots, and everything in between. If you're in Rajajinagar for content work, it's the one stop that turns a day of exploring the neighborhood into a day of actually getting your shoot done, with a soundproofed room, multi-camera setups, and a dedicated makeup and dressing room all in one place.
          </p>

          <h2>Why This Matters If You're Shooting at Nearby Studio</h2>
          <p>
            Since Nearby Studio is based right in Rajajinagar, none of this requires planning around Bengaluru traffic the way a trip to, say, MG Road or Indiranagar would. Grab breakfast at the local market, wrap your session, and still have time for the ISKCON Temple or Orion Mall — all without leaving the neighborhood.
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

export default BlogPostTop5PlacesRajajinagar;
