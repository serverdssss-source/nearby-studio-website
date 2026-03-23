import { useEffect, useState } from 'react'
import './Instagram_tail.css'

export default function InstagramTail() {
  const profileUrl = 'https://www.instagram.com/nearbystudio_/'
  const fallbackPosts = [
    {
      id: '01',
      image: '/4.webp',
      alt: 'Professional green screen setup',
      href: profileUrl
    },
    {
      id: '02',
      image: '/3.webp',
      alt: 'Studio production lighting setup',
      href: profileUrl
    },
    {
      id: '03',
      image: '/1.webp',
      alt: 'Content creation shoot in progress',
      href: profileUrl
    },
    {
      id: '04',
      image: '/1.webp',
      alt: 'Professional green screen setup',
      href: profileUrl
    },
    {
      id: '05',
      image: '/2.webp',
      alt: 'Studio production lighting setup',
      href: profileUrl
    },
    {
      id: '06',
      image: '/5.webp',
      alt: 'Content creation shoot in progress',
      href: profileUrl
    }
  ]
  const [instagramPosts, setInstagramPosts] = useState(fallbackPosts)

  useEffect(() => {
    let cancelled = false

    async function loadInstagramPosts() {
      try {
        const response = await fetch(`/api/instagram-posts?t=${Date.now()}`, { cache: 'no-store' })
        if (!response.ok) return
        const data = await response.json()
        if (!Array.isArray(data?.posts) || data.posts.length === 0 || cancelled) return

        const normalized = data.posts.slice(0, 6).map((post, index) => ({
          id: String(index + 1).padStart(2, '0'),
          image: post.image,
          alt: post.alt || `Instagram post ${index + 1}`,
          href: post.href || profileUrl
        }))

        setInstagramPosts(normalized)
      } catch {
        // Keep fallback content if API is unavailable.
      }
    }

    loadInstagramPosts()
    const intervalId = window.setInterval(loadInstagramPosts, 120000)

    return () => {
      cancelled = true
      window.clearInterval(intervalId)
    }
  }, [])

  return (
    <section className="greenscreen-instagram" aria-labelledby="instagram-heading">
      <div className="greenscreen-instagram__header">
        <h2 id="instagram-heading">Instagram</h2>
        <p>Latest updates from our studio production space.</p>
      </div>

      <div className="greenscreen-instagram__grid">
        {instagramPosts.map((post) => (
          <a
            key={post.id}
            className="greenscreen-instagram__card"
            href={post.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`View Instagram post ${post.id}`}
          >
            <img
              src={post.image}
              alt={post.alt}
              width="400"
              height="400"
              loading="lazy"
              style={{ aspectRatio: '1/1', objectFit: 'cover' }}
            />

            <span className="greenscreen-instagram__overlay">
              View on Instagram
            </span>

          </a>
        ))}
      </div>

      <div className="greenscreen-instagram__cta">
        <a
          className="greenscreen-instagram__btn"
          href={profileUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          Follow on Instagram
        </a>
      </div>
    </section>
  )
}
