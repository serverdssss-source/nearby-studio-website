import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ContactForm from '../components/ContactForm';
import SEO from '../components/SEO';
import BlogImage from '../components/BlogImage';
import './Blog.css';

const BlogPostLensGuide = () => {
  return (
    <>
      <SEO
        title="35mm vs 50mm vs 85mm Lens for Podcasts, Portraits and Products | Nearby Studio"
        description="Which lens should you use? A 35mm for tight rooms and wide podcast shots, a 50mm as the all-rounder, and an 85mm for flattering portraits and close-ups. A simple guide for podcasts, portraits and product shoots."
        type="article"
        ogImage="/book_our_show/podcast/custom_setup_3.webp"
      />
      <main className="blog-section">
        <Navbar />
        <div className="blog-container">
        <Link to="/blog" className="blog-back-link">← Back to Blog</Link>

        <article className="blog-content">
          <h1 className="blog-title">35mm, 50mm or 85mm: Which Lens Suits Podcasts, Portraits and Products?</h1>

          <BlogImage src="/book_our_show/podcast/custom_setup_3.webp" alt="Two-chair podcast setup with boom mics and overhead lights at Nearby Studio, Rajajinagar" width={1122} height={1402} priority />

          <p>
            The short answer: use a 35mm for tight rooms and wide podcast shots, a 50mm when you want one lens that does a bit of everything, and an 85mm for flattering portraits and tighter close-ups when you have room to step back. For products, a 50mm works for most items, while small items like jewellery are usually better with a macro lens or an 85mm. Everything below explains why, so you can pick the right lens for your next shoot.
          </p>

          <div className="blog-takeaways">
            <p><strong>Key takeaways</strong></p>
            <ul>
              <li>Focal length controls how much of the scene you capture and how the face and background look.</li>
              <li>35mm is wide and needs care with faces. 50mm looks closest to natural vision. 85mm flatters faces and blurs backgrounds.</li>
              <li>The space you have decides a lot. Longer lenses need more distance from your subject.</li>
              <li>These numbers assume a full-frame camera. On a crop sensor, the view is tighter.</li>
            </ul>
          </div>

          <h2>What does focal length actually mean?</h2>
          <p>
            Focal length, measured in millimetres, tells you how wide or tight the picture will be. A smaller number (35mm) fits more of the scene into the frame. A bigger number (85mm) zooms in, shows less of the scene and makes the background look closer to the subject.
          </p>
          <p>
            It also changes how faces look. Wide lenses used up close can stretch features, while longer lenses flatten them slightly, which most people find more flattering.
          </p>

          <h2>Does the sensor size change these numbers?</h2>
          <p>
            Yes. The figures above are for full-frame cameras. On a crop-sensor camera, which many beginners use, the picture is cropped in. Multiply the focal length by roughly 1.5 (about 1.6 on Canon) to see what you'll actually get. A 35mm lens on a crop-sensor camera looks closer to a 50mm, and a 50mm looks closer to a 75mm.
          </p>

          <h2>Which lens is best for podcasts?</h2>
          <p>
            <strong>35mm is the most practical for a studio podcast.</strong> It lets you fit two people and the table into a single wide shot without needing a huge room, and it's comfortable for medium shots when the cameras are close to the guests.
          </p>
          <p>
            <strong>50mm is the all-rounder.</strong> It's good for a medium shot of one speaker without noticeable distortion, and it's the lens many podcast creators use for their main camera.
          </p>
          <p>
            <strong>85mm is best for tight close-ups.</strong> On a multi-camera setup, it makes a good "close-up" angle for emotional moments and reactions. The catch is that you need distance, so the camera has to sit well back from the guest.
          </p>
          <p>
            A common three-camera approach is one wide camera on a 35mm, one medium on a 50mm and one tight on an 85mm, so the editor has three distinct angles to cut between. See our <Link to="/podcast">podcast studio page</Link> for the multi-camera setups we offer.
          </p>

          <h2>Which lens is best for portraits?</h2>
          <p>
            <strong>85mm is the classic portrait lens.</strong> It flatters faces, softens the background and lets you stand a comfortable distance from your subject, which also helps nervous first-time models relax.
          </p>
          <p>
            <strong>50mm works well for half-body and casual portraits</strong> and is more forgiving in smaller spaces.
          </p>
          <p>
            <strong>35mm suits environmental portraits</strong>, where you want to show the person and the setting around them. Keep it a little further from the face to avoid distortion.
          </p>

          <h2>Which lens is best for product photography?</h2>
          <p>
            <strong>50mm is the general-purpose choice</strong> for bottles, bags, shoes, gadgets and most everyday products. It gives a natural look without bending straight lines.
          </p>
          <p>
            <strong>35mm helps with larger items and flat lays</strong>, where you need to fit a lot into the frame from a limited height.
          </p>
          <p>
            <strong>85mm or a dedicated macro lens suits small products</strong> like jewellery, watches and cosmetics, where you need to get close to show fine detail. Note that a regular 85mm can't focus as close as a true macro lens, so check the minimum focusing distance.
          </p>
          <p>
            Planning a product shoot? Our guide to <Link to="/blog/fashion-shoot-vs-product-shoot-rajajinagar">fashion shoots vs product shoots</Link> covers how the two differ.
          </p>

          <h2>Quick comparison</h2>
          <div className="blog-table-wrap">
            <table className="blog-table">
              <thead>
                <tr>
                  <th></th>
                  <th>35mm</th>
                  <th>50mm</th>
                  <th>85mm</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th>Field of view</th>
                  <td>Wide</td>
                  <td>Natural</td>
                  <td>Tight</td>
                </tr>
                <tr>
                  <th>Podcast use</th>
                  <td>Wide two-shot, small rooms</td>
                  <td>Main camera, medium shots</td>
                  <td>Close-ups, reactions</td>
                </tr>
                <tr>
                  <th>Portrait use</th>
                  <td>Environmental portraits</td>
                  <td>Half-body, casual</td>
                  <td>Classic flattering portraits</td>
                </tr>
                <tr>
                  <th>Product use</th>
                  <td>Large items, flat lays</td>
                  <td>General products</td>
                  <td>Small items, detail</td>
                </tr>
                <tr>
                  <th>Space needed</th>
                  <td>Least</td>
                  <td>Moderate</td>
                  <td>Most</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h2>How do you choose if you can only buy one?</h2>
          <p>
            If you can buy only one lens, the 50mm is the safest. It's affordable, versatile and rarely the wrong choice. If you mostly shoot in tight spaces, pick the 35mm. If you mostly shoot portraits and have room to work, pick the 85mm.
          </p>

          <h2>Why does the room matter so much?</h2>
          <p>
            Lens choice and space go together. An 85mm lens in a small room forces you to shoot tighter than you may want, while a 35mm in a large room can leave subjects looking small in the frame. A roomy studio gives you the freedom to use longer lenses and place cameras at different distances, which is one reason many creators prefer shooting in a studio instead of at home.
          </p>

          <h2>Planning a shoot at Nearby Studio?</h2>
          <p>
            If you're not sure which lens or camera angle suits your shoot, tell us what you're making, whether it's a podcast, a portrait session or a product shoot, and how many people are involved. We'll help you plan the right setup. You can reach us on <a href="tel:+916366623955">+91 63666 23955</a> or through the <Link to="/contactus">contact form</Link>.
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

export default BlogPostLensGuide;
