import React, { lazy, Suspense, useEffect, useRef, memo, useState } from 'react'
import { Link } from 'react-router-dom'
import './StudioSnapshot.css'
const SplashCursor = lazy(() => import('./SplashCursor'));

const StudioSnapshot = memo(() => {
  const galleryImages = [
    '/Snapshots1/6.jpg',
    '/Snapshots1/2.jpg',
    '/Snapshots1/5.jpg',
    '/Snapshots1/9.jpg',
    '/Snapshots1/10.jpg',
    '/Snapshots1/11.jpg',
    '/Snapshots1/21.jpg',
    '/Snapshots1/13.jpg',
    '/Snapshots1/8.jpg',
    '/Snapshots1/4.jpg',
    '/Snapshots1/19.jpg',
    '/Snapshots1/7.jpg',
    '/Snapshots1/12.jpg',
    '/Snapshots1/1.jpg',
    '/Snapshots1/17.jpg',
    '/Snapshots1/15.jpg',
  ]
  const sectionRef = useRef(null)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 768px)')
    const syncMobileState = () => setIsMobile(mediaQuery.matches)
    syncMobileState()
    mediaQuery.addEventListener('change', syncMobileState)
    return () => mediaQuery.removeEventListener('change', syncMobileState)
  }, [])

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const wrappers = section.querySelectorAll('.hover-gallery-image-wrapper')

    wrappers.forEach((wrapper) => {
      const img = wrapper.querySelector('.hover-img')
      let showTimeout = null

      const handleMouseEnter = () => {
        if (showTimeout) clearTimeout(showTimeout)
        img.classList.remove('fade-out')
        img.style.opacity = '1'
        img.style.transform = 'scale(1.15)'
      }

      const handleMouseLeave = () => {
        showTimeout = setTimeout(() => {
          img.classList.add('fade-out')
          img.style.opacity = '0'
          img.style.transform = 'scale(1)'
        }, 600)
      }

      wrapper.addEventListener('mouseenter', handleMouseEnter)
      wrapper.addEventListener('mouseleave', handleMouseLeave)

      wrapper._cleanup = () => {
        wrapper.removeEventListener('mouseenter', handleMouseEnter)
        wrapper.removeEventListener('mouseleave', handleMouseLeave)
      }
    })

    return () => {
      wrappers.forEach((wrapper) => {
        if (wrapper._cleanup) wrapper._cleanup()
      })
    }
  }, [])

  return (
    <section className="service-hero-section" ref={sectionRef}>
      {!isMobile && (
        <Suspense fallback={null}>
          <SplashCursor />
        </Suspense>
      )}
      <div className="abs-gallery-grid">
        {galleryImages.map((img, index) => (
          <div key={index} className="hover-gallery-image-wrapper">
            <img
              alt={`Studio gallery ${index + 1}`}
              className="hover-img"
              loading="lazy"
              decoding="async"
              src={img}
            />
          </div>
        ))}
      </div>

      <div className="service-hero-con">
        <div className="service-card">
          <div className="section-title in-service">STUDIO SNAPSHOT</div>

          <h2 className="service-hero-title">
            Production-ready studio floor
            <br className="mobile-title-break" /> <span> </span>
            crafted for fast turnarounds.
          </h2>

          <p className="service-hero-heading">
            Nearby Studio is a premium, production-ready studio floor designed for brands, creators, agencies,
            and film teams who need a reliable space with smooth workflows from pre-production to final delivery.
          </p>

          <div className="studio-meta">
            <div className="detail-card">
              <p className="detail-title">Why teams choose nearby studio</p>
              <ul className="studio-points">
                <li>Smooth handoff from pre-production to delivery.</li>
                <li>Ready-to-roll lighting and acoustically tuned rooms.</li>
                <li>On-site crew support for creators, brands, and agencies.</li>
              </ul>
            </div>

            <div className="stat-grid">
              <div className="stat-card">
                <div className="stat-number">600</div>
                <div className="stat-label">Total sq.ft</div>
                <div className="stat-sub">Open-plan layout with staging zone.</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">
                  500
                  <span style={{ fontSize: "0.5em", opacity: 0.8, }}>
                    sq.ft.
                  </span>
                </div>
                <div className="stat-label">Production floor</div>
                <div className="stat-sub">Optimized for multi-camera setups.</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">10</div>
                <div className="stat-label">Built-in setups</div>
                <div className="stat-sub">Podcasts, content creation, and product shoots.</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">1</div>
                <div className="stat-label">Green room</div>
                <div className="stat-sub">Makeup, costume change, and quick resets.</div>
              </div>
            </div>
          </div>

          <div className="cta-row">
            <Link to="/book" state={{ package: { id: 'snapshot', name: 'Studio Snapshot', duration: '2 Hours', price: 2999, features: ['2 Hours AC Studio Session', 'Access to makeup & dressing room'] } }} className="primary-btn in-service">
              <div className="link-hover">
                <div className="link-inner">
                  <div className="button-text">BOOK NEARBY STUDIO</div>
                </div>
                <div className="link-inner-hover">
                  <div className="button-text">BOOK NEARBY STUDIO</div>
                </div>
              </div>
            </Link>
            <div className="cta-note">
              Share your shoot window—
              <br className="mobile-cta-break" />
              we reply with availability in minutes.
            </div>
          </div>
        </div>
      </div>
    </section>
  )
})

StudioSnapshot.displayName = 'StudioSnapshot'

export default StudioSnapshot
