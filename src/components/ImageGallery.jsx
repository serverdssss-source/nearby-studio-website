import { useRef, useState, useEffect, memo } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

const MOBILE_BREAKPOINT = 768

const IMAGES = [
  { src: '/book_our_show/corporate heads/black_monochrome_setup.webp', id: '_4' },
  { src: '/book_our_show/content_creators/content_creator_setup.webp', id: '_3' },
  { src: '/book_our_show/founder/founder_room.webp', id: '_2' },
  { src: '/ImageGallery/nearby studio_pitch.webp', id: '_1' },
]

const AMENITIES = [
  'Makeup/Audio/Dressing Room',
  '24/7 Power Backup',
  'Parking Space',
  'High Speed Internet',
  'Premium Podcast Setup',
  '50+ Props Option',
  'Tethering Cables',
  'Beauty Dish',
  'Wooden Chairs & Stools',
  'Cloth backdrop',
  'Cafeteria',
  '2 Strobe lights',
  'Elinchrom FRX 400 Kit',
  'Product Shoot Table',
  '32” HD Smart TV',
  '6 LED Lights (Videography)',
]

const amenitiesContainerStyle = {
  position: 'relative',
  maxWidth: '1200px',
  margin: '0 auto',
  padding: '0.75rem 1rem 2.5rem',
}

const amenitiesHeaderStyle = {
  textAlign: 'center',
  marginBottom: '3.5rem',
}

const amenitiesTitleStyle = {
  margin: 0,
  fontSize: 'clamp(2rem, 5vw, 3.25rem)',
  fontWeight: 800,
  letterSpacing: '-0.02em',
  color: '#f5f5f3',
  background: 'linear-gradient(90deg,#ffffff,#00c2a8)',
  backgroundClip: 'text',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
}

const amenitiesGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
  gap: '20px',
}

const amenitiesCardStyle = {
  padding: '22px',
  borderRadius: '18px',
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.06)',
  position: 'relative',
  overflow: 'hidden',
}

const amenitiesCardTopBarStyle = {
  position: 'absolute',
  top: 0,
  left: 0,
  height: '4px',
  width: '100%',
  background: 'linear-gradient(90deg,#00c2a8,#00f5d4)',
}

const amenitiesCardTextStyle = {
  margin: 0,
  fontSize: '16px',
  fontWeight: 600,
  color: '#e6f7f5',
  lineHeight: 1.45,
}

const AmenitiesCards = memo(() => (
  <div style={amenitiesContainerStyle}>
    <div style={amenitiesGridStyle}>
      {AMENITIES.map((item) => (
        <div key={item} style={amenitiesCardStyle}>
          <div style={amenitiesCardTopBarStyle} />
          <p style={amenitiesCardTextStyle}>{item}</p>
        </div>
      ))}
    </div>
  </div>
))

AmenitiesCards.displayName = 'AmenitiesCards'

function getDesktopPositionStyle(id) {
  const baseStyle = {
    position: 'absolute',
    borderRadius: '16px',
    overflow: 'hidden',
  }

  switch (id) {
    case '_4':
      return { ...baseStyle, width: '45%', height: '40%', top: '5%', left: '50%', x: '-50%', zIndex: 40 }
    case '_3':
      return { ...baseStyle, width: '45%', height: '40%', top: '25%', left: '5%', zIndex: 30 }
    case '_2':
      return { ...baseStyle, width: '45%', height: '40%', top: '25%', right: '5%', zIndex: 30 }
    case '_1':
      return { ...baseStyle, width: '45%', height: '40%', bottom: '5%', left: '50%', x: '-50%', zIndex: 20 }
    default:
      return baseStyle
  }
}

const AnimatedGalleryCard = memo(({ img, index, scrollYProgress }) => {
  const start = 0.1 + index * 0.15
  const end = start + 0.25

  const y = useTransform(scrollYProgress, [start, end], ['0%', '-150%'])
  const opacity = useTransform(scrollYProgress, [start + 0.1, end], [1, 0])
  const scale = useTransform(scrollYProgress, [start, end], [1, 0.9])

  return (
    <motion.div
      style={{
        ...getDesktopPositionStyle(img.id),
        y,
        opacity,
        scale,
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.4)',
      }}
    >
      <img
        src={img.src}
        alt="Gallery"
        loading="lazy"
        decoding="async"
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
      />
    </motion.div>
  )
})

AnimatedGalleryCard.displayName = 'AnimatedGalleryCard'

const DesktopImageGallery = memo(() => {
  const containerRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  })

  const headingOpacity = useTransform(scrollYProgress, [0.7, 0.85], [0, 1])
  const headingY = useTransform(scrollYProgress, [0.7, 0.9], [50, 0])

  return (
    <section
      style={{
        position: 'relative',
        backgroundColor: '#0F0F12',
      }}
    >
      <div
        ref={containerRef}
        style={{
          position: 'relative',
          height: '400vh',
        }}
      >
        <div
          style={{
            position: 'sticky',
            top: 0,
            height: '100vh',
            width: '100%',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 1rem',
          }}
        >
          <div style={{ position: 'relative', width: '100%', height: '80vh', maxWidth: '1280px' }}>
            {IMAGES.map((img, index) => (
              <AnimatedGalleryCard key={img.id} img={img} index={index} scrollYProgress={scrollYProgress} />
            ))}

            <motion.div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10,
                opacity: headingOpacity,
                y: headingY,
                padding: '0 1rem',
              }}
            >
              <h2
                style={{
                  color: '#F5F5F3',
                  fontSize: '4rem',
                  fontWeight: 800,
                  textAlign: 'center',
                  lineHeight: 1.2,
                }}
              >
                AMENITIES & FEATURES
              </h2>
              <div style={{ marginTop: '14px', width: '100%' }}>
                <AmenitiesCards />
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
})

DesktopImageGallery.displayName = 'DesktopImageGallery'

const MobileImageGallery = memo(() => (
  <>
    <section
      style={{
        position: 'relative',
        backgroundColor: '#0F0F12',
        padding: '2rem 1rem 0',
      }}
    >
      <div style={{ maxWidth: '720px', margin: '0 auto', display: 'grid', gap: '1rem' }}>
        {IMAGES.map((img) => (
          <div
            key={img.id}
            style={{
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.4)',
            }}
          >
            <img
              src={img.src}
              alt="Gallery"
              loading="lazy"
              decoding="async"
              style={{ width: '100%', display: 'block', aspectRatio: '4 / 3', objectFit: 'cover' }}
            />
          </div>
        ))}
      </div>
      <h2
        style={{
          margin: '2rem 0 1rem',
          color: '#F5F5F3',
          fontSize: 'clamp(1.75rem, 8vw, 2.5rem)',
          fontWeight: 800,
          textAlign: 'center',
          lineHeight: 1.2,
        }}
      >
        AMENITIES & FEATURES
      </h2>
      <AmenitiesCards />
    </section>
  </>
))

MobileImageGallery.displayName = 'MobileImageGallery'

const ImageGallery = memo(() => {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    checkMobile()
    window.addEventListener('resize', checkMobile, { passive: true })
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return isMobile ? <MobileImageGallery /> : <DesktopImageGallery />
})

ImageGallery.displayName = 'ImageGallery'

export default ImageGallery
