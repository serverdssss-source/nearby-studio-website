import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ContactForm from '../components/ContactForm';
import './Blog.css';

const BlogPostThreePointLighting = () => {
  return (
    <>
      <main className="blog-section">
        <Navbar />
        <div className="blog-container">
        <Link to="/blog" className="blog-back-link">← Back to Blog</Link>
        
        <article className="blog-content">
          <h1 className="blog-title">Three-Point Lighting Explained: The Setup Behind Every Professional Shot</h1>
          
          <p>
            Almost every professionally lit shot you've ever seen — interviews, product photos, YouTube videos, corporate headshots — is built on the same basic principle: three-point lighting. It sounds technical, but the idea is simple once you break it down, and understanding it is the fastest way to see why some content looks polished and some looks flat, no matter how good the camera is.
          </p>

          <p>Here's how it actually works.</p>

          <h2>The Three Lights, Explained</h2>

          <h3>1. Key Light — The Main Source</h3>
          <p>
            This is your primary light, usually placed at roughly a 45-degree angle to the subject's face. It's the brightest of the three and does most of the work of shaping how the subject is lit — highlighting features, creating a sense of depth, and setting the overall brightness of the shot. Everything else builds around this one.
          </p>

          <h3>2. Fill Light — Softening the Shadows</h3>
          <p>
            Placed on the opposite side of the key light, the fill light is dimmer and exists purely to soften the shadows the key light creates. Without it, one side of the face or subject ends up too dark, creating harsh, uneven contrast. The fill doesn't eliminate shadow entirely — a little shadow adds dimension — it just keeps it from looking harsh or unflattering.
          </p>

          <h3>3. Back Light (or Rim Light) — Separation From the Background</h3>
          <p>
            Positioned behind the subject, aimed toward the camera, this light creates a subtle outline or "rim" of light around the subject's edges — hair, shoulders, silhouette. Its whole job is separation: making sure the subject doesn't visually blend into the background, especially when both are similarly lit or colored.
          </p>

          <h2>Why All Three Matter Together</h2>
          <p>
            Skip the fill light, and you get harsh, uneven shadows across the face. Skip the back light, and the subject can look flat and merged into the background, even if the front lighting is perfect. Skip the key light and rely only on ambient room light, and everything looks dim and directionless. It's the combination of all three — not any single one — that creates that clean, professional, "produced" look.
          </p>

          <h2>Why This Is Hard to Get Right at Home</h2>
          <p>
            This is exactly where most home and DIY setups fall apart — not because the equipment doesn't exist, but because getting three lights positioned, balanced, and angled correctly takes real space and the right gear, neither of which a bedroom corner or a single ring light can offer. A ring light alone acts as one flat, front-facing source — it's fine for casual content, but it can't replicate the depth and separation that proper three-point lighting creates.
          </p>

          <h2>Come Shoot It Properly at Nearby Studio</h2>
          <p>
            This is exactly the setup we've built Nearby Studio around. We've got a genuinely spacious room — enough space to actually position key, fill, and back lights the right distance and angle apart, instead of cramming everything into a tight corner — plus multiple professional lighting units on hand for exactly this kind of setup, whether it's a podcast interview, a product shoot, or a full brand video.
          </p>

          <p>
            If you've been trying to make a single light or a ring light work and wondering why your content still doesn't look quite "produced," this is usually why. Come shoot at Nearby Studio and see the difference proper three-point lighting makes — the room, the lights, and the space to actually use them right are already here.
          </p>

          <hr className="blog-divider" />
          
          <p className="blog-footer">
            <em><Link to="/">Nearby Studio</Link> is a creative production vertical of Sripada Studios Pvt. Ltd., Bengaluru.</em>
          </p>
        </article>
      </div>
    </main>
      <ContactForm />
    </>
  );
};

export default BlogPostThreePointLighting;
