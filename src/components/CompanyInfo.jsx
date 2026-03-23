import React, { lazy, Suspense, useEffect, useRef, useState } from 'react'
import './CompanyInfo.css'
const ColorBlends = lazy(() => import('./ColorBlends'))

function CompanyInfo() {
  const sectionRef = useRef(null)
  const [shouldLoadVideo, setShouldLoadVideo] = useState(false)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoadVideo(true)
          observer.disconnect()
        }
      },
      { rootMargin: '250px 0px' }
    )

    observer.observe(section)
    return () => observer.disconnect()
  }, [])

  return (
    <section className="company-info-section" ref={sectionRef}>
      {/* Background Layer */}
      <div className="company-bg">
        <Suspense fallback={null}>
          <ColorBlends
            colors={["#00c2a8", "#0f0f12", "#00433a"]}
            rotation={105}
            speed={0.1}
            scale={1}
            frequency={1}
            warpStrength={1}
            mouseInfluence={1}
            parallax={4}
            noise={0.1}
            transparent
            autoRotate={0}
            color=""
          />
        </Suspense>
      </div>

      <div className="company-info-container">
        <div className="company-left">
          <div className="company-label">Proudly A Sub-Company Of</div>

          <h2 className="company-heading">
            <span className="company-highlight">
              Sripada Studios Pvt. Ltd.
            </span>
          </h2>

          <div className="company-divider" />

          <div className="company-copy">
            <p>
              nearbystudio is a proud vertical of Sripada Studios Pvt. Ltd., Bengaluru<br />
              A creative conglomerate built on originality, bold thinking,
              & service-oriented execution.
            </p>

            <p>
              As part of Sripada Studios, we operate within a larger ecosystem
              of creative strategy, production excellence, and brand-building capabilities
              ensuring every deliverable is aligned to quality and impact.
            </p>
          </div>
        </div>

        <div className="company-video-wrapper">
          <video
            autoPlay
            muted
            loop
            playsInline
            className="company-video"
            preload="none"
          >
            {shouldLoadVideo && (
              <source
                src="/nearby outro final.mp4"
                type="video/mp4"
              />
            )}
          </video>
        </div>
      </div>
    </section>
  )
}

export default CompanyInfo
