import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

/* ─────────────────────────────────────────────────────────────
   Image sets
   All images are portrait (vertical) to match the reference.
───────────────────────────────────────────────────────────── */

// ROW 1 – scrolls right → left
const ROW1 = [
  '/model_shoot/bharthanatyam/2.webp',
  '/model_shoot/bharthanatyam/3.webp',
  '/model_shoot/navarasa/5.webp',
  '/model_shoot/navarasa/8.webp',
]

// ROW 2 – scrolls left → right
const ROW2 = [
  '/model_shoot/imgs/9.webp',
  '/model_shoot/imgs/11.webp',
  '/model_shoot/imgs/10.webp',
  '/model_shoot/imgs/12.webp',
]

// // ROW 3 – scrolls right → left
// const ROW3 = [
//   '/book_our_show/podcast/custom_setup_1.webp',
//   '/book_our_show/corporate heads/organic_setup.webp',
//   '/book_our_show/podcast/custom_setup_2.webp',
//   '/book_our_show/content_creators/content_creator_2.webp',
// ]

/* ─────────────────────────────────────────────────────────────
   Reduced size and increased gaps.
───────────────────────────────────────────────────────────── */
const CARD_W = '18vw'
const CARD_H = '24vw'
const GAP = '2vw' // Gap between images and rows

export default function FashionGallery() {
  const wrapRef = useRef(null)

  const { scrollYProgress } = useScroll({
    target: wrapRef,
    offset: ['start end', 'end start'],
  })

  /*
   * ROW 1: scrolls RIGHT → LEFT
   */
  const row1X = useTransform(scrollYProgress, [0, 1], ['25vw', '-15vw'])

  /*
   * ROW 2: scrolls LEFT → RIGHT
   */
  const row2X = useTransform(scrollYProgress, [0, 1], ['-10vw', '15vw'])

  /*
   * ROW 3: scrolls RIGHT → LEFT
   */
  // const row3X = useTransform(scrollYProgress, [0, 1], ['15vw', '-5vw'])

  return (
    <div
      ref={wrapRef}
      style={{
        width: '100%',
        background: '#0F0F12',
        paddingBottom: '1px', // prevent margin collapse
        overflow: 'hidden',
      }}
    >
      {/* ── Small eyebrow label ───────────────────────────── */}
      <div style={{ padding: '3.5rem 2rem 2rem' }}>
        <p style={{
          fontFamily: "'Outfit', sans-serif",
          fontSize: '0.68rem',
          letterSpacing: '0.28em',
          color: '#00c2a8',
          textTransform: 'uppercase',
          display: 'flex',
          alignItems: 'center',
          gap: '0.85rem',
          margin: 0,
        }}>
          <span style={{
            width: 24,
            height: 1,
            background: '#00c2a8',
            display: 'inline-block',
            flexShrink: 0,
          }} />
          Studio Gallery
        </p>
      </div>

      {/* ══════════════════════════════════════════════════════
          ROW 1 — Horizontal strip, scrolls right → left
      ══════════════════════════════════════════════════════ */}
      <div style={{
        overflow: 'hidden',
        width: '100%',
        paddingBottom: GAP,
      }}>
        <motion.div
          style={{
            display: 'flex',
            gap: GAP,
            x: row1X,
            paddingLeft: '2vw'
          }}
        >
          {ROW1.map((src, i) => (
            <motion.div
              key={i}
              initial={{ clipPath: 'inset(0% 0% 100% 0%)' }}
              whileInView={{ clipPath: 'inset(0% 0% 0% 0%)' }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{
                duration: 0.25,
                delay: i * 0.05,
                ease: [0.77, 0, 0.175, 1], // Sharp, crisp easing
              }}
              style={{
                width: CARD_W,
                height: CARD_H,
                flexShrink: 0,
                overflow: 'hidden',
                borderRadius: '16px', // Added rounded corners
                boxShadow: '0 12px 32px rgba(0,0,0,0.5)',
              }}
            >
              <img
                src={src}
                alt="Studio"
                loading="lazy"
                decoding="async"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                }}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* ══════════════════════════════════════════════════════
          ROW 2 — Horizontal strip, scrolls left → right
      ══════════════════════════════════════════════════════ */}
      <div style={{
        overflow: 'hidden',
        width: '100%',
        paddingBottom: GAP,
      }}>
        <motion.div
          style={{
            display: 'flex',
            gap: GAP,
            x: row2X,
            paddingLeft: '2vw'
          }}
        >
          {ROW2.map((src, i) => (
            <motion.div
              key={i}
              initial={{ clipPath: 'inset(0% 0% 100% 0%)' }}
              whileInView={{ clipPath: 'inset(0% 0% 0% 0%)' }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{
                duration: 0.6,
                delay: i * 0.15,
                ease: [0.77, 0, 0.175, 1], // Sharp, crisp easing
              }}
              style={{
                width: CARD_W,
                height: CARD_H,
                flexShrink: 0,
                overflow: 'hidden',
                borderRadius: '16px', // Added rounded corners
                boxShadow: '0 12px 32px rgba(0,0,0,0.5)',
              }}
            >
              <img
                src={src}
                alt="Studio"
                loading="lazy"
                decoding="async"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                }}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* ══════════════════════════════════════════════════════
          ROW 3 — commented out
      ══════════════════════════════════════════════════════ */}
      {/* <div style={{ overflow: 'hidden', width: '100%', paddingBottom: '3.5rem' }}>
        <motion.div
          style={{
            display: 'flex',
            gap: GAP,
            x: row3X,
            paddingLeft: '2vw'
          }}
        >
          {ROW3.map((src, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: -60 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{
                duration: 0.8,
                delay: i * 0.15,
                ease: [0.22, 0.61, 0.36, 1],
              }}
              style={{
                width: CARD_W,
                height: CARD_H,
                flexShrink: 0,
                overflow: 'hidden',
                borderRadius: '16px',
                boxShadow: '0 12px 32px rgba(0,0,0,0.5)',
              }}
            >
              <img
                src={src}
                alt="Studio"
                loading="lazy"
                decoding="async"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                }}
              />
            </motion.div>
          ))}
        </motion.div>
      </div> */}
    </div>
  )
}
