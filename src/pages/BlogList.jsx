import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ContactForm from '../components/ContactForm';
import './Blog.css';

const postsData = [
  {
    path: "/blog/top-5-places-to-visit-near-rajajinagar-bengaluru",
    title: "Top 5 Places to Visit Near Rajajinagar, Bengaluru",
    excerpt: "Rajajinagar is one of those Bengaluru neighborhoods that quietly has a lot going on right within it — old-city character, a solid food scene, temples, malls, and even an indoor snow park...",
    date: "July 29, 2026",
    author: "Nearby Studio"
  },
  {
    path: "/blog/beyond-four-walls",
    title: "Beyond Four Walls: How Nearby Studio Fits Into the Sripada Studios Ecosystem",
    excerpt: "Book a room, bring your gear, shoot, leave — that's how most people think about studio rentals. It's also where most studios stop. Nearby Studio was built differently...",
    date: "July 25, 2026",
    author: "Nearby Studio"
  },
  {
    path: "/blog/green-screen-shoots-bengaluru",
    title: "Green Screen Shoots in Bengaluru: What They're Actually Used For (Beyond VFX)",
    excerpt: "Say \"green screen\" and most people picture a Marvel movie set — actors in motion-capture suits, superhero backdrops, million-dollar VFX budgets. That image stops a lot of creators and small brands from even considering it...",
    date: "July 24, 2026",
    author: "Nearby Studio"
  },
  {
    path: "/blog/why-podcast-production-matters",
    title: "Why Podcast Production Actually Matters for Your Brand",
    excerpt: "Most founders and business heads still file \"podcast\" under marketing — one more content format to hand off to the social media team. That's underselling it. A well-produced podcast does things a marketing calendar can't...",
    date: "July 17, 2026",
    author: "Nearby Studio"
  },
  {
    path: "/blog/fashion-shoot-vs-product-shoot-rajajinagar",
    title: "Fashion Shoot vs. Product Shoot in Rajajinagar, Bengaluru: Do You Need a Different Studio Setup?",
    excerpt: "If you're booking a studio in Rajajinagar, Bengaluru for the first time, this question trips up more people than you'd expect: is a fashion shoot setup and a product shoot setup actually different...",
    date: "July 17, 2026",
    author: "Nearby Studio"
  },
  {
    path: "/blog/5-signs-youve-outgrown-shooting-content-at-home",
    title: "5 Signs You've Outgrown Shooting Content at Home (And Need a Studio)",
    excerpt: "Every content creator starts the same way — a ring light, a corner of the living room, and whatever backdrop doesn't have laundry piled behind it. That's fine when you're posting for fun...",
    date: "July 16, 2026",
    author: "Nearby Studio"
  },
  {
    path: "/blog/podcast-recording-studio-rajajinagar",
    title: "Podcast Recording Studio in Rajajinagar, Bengaluru: Full Setup Guide + Rental Costs",
    excerpt: "If you've been searching for a podcast recording studio in Rajajinagar, Bengaluru, you've probably run into the same problem everyone does: either the space looks great but has zero information on pricing...",
    date: "July 16, 2026",
    author: "Nearby Studio"
  }
];

const BlogList = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 6;
  const totalPages = Math.ceil(postsData.length / postsPerPage);
  
  const startIndex = (currentPage - 1) * postsPerPage;
  const currentPosts = postsData.slice(startIndex, startIndex + postsPerPage);

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };
  
  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  return (
    <>
      <main className="blog-section">
        <Navbar />
        <div className="blog-container" style={{ maxWidth: '1200px' }}>
        <h1 className="blog-title">Our Blog</h1>
        
        <div className="blog-list">
          {currentPosts.map((post, index) => (
            <Link key={index} to={post.path} className="blog-card">
              <div className="blog-card-content">
                <h2 className="blog-card-title">{post.title}</h2>
                <p className="blog-card-excerpt">
                  {post.excerpt}
                </p>
                <div className="blog-card-meta">
                  <span className="blog-card-date">{post.date}</span>
                </div>
                <div className="blog-card-author">
                  <div className="blog-card-avatar">N</div>
                  <span className="blog-card-author-name">{post.author}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {totalPages > 1 && (
          <div className="blog-pagination" style={{ borderTop: 'none', marginTop: '3rem' }}>
            {currentPage > 1 ? (
              <button onClick={handlePrev} className="blog-pagination-link" style={{ background: 'none', border: 'none', cursor: 'pointer', outline: 'none' }}>← Previous</button>
            ) : (
              <span className="blog-pagination-link disabled">← Previous</span>
            )}
            
            <span className="blog-pagination-number">{currentPage} / {totalPages}</span>
            
            {currentPage < totalPages ? (
              <button onClick={handleNext} className="blog-pagination-link" style={{ background: 'none', border: 'none', cursor: 'pointer', outline: 'none' }}>Next →</button>
            ) : (
              <span className="blog-pagination-link disabled">Next →</span>
            )}
          </div>
        )}

      </div>
    </main>
      <ContactForm />
    </>
  );
};

export default BlogList;
