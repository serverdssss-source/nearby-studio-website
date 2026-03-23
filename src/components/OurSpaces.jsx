import React, { useEffect, useRef, memo, useCallback } from 'react'
import './OurSpaces.css'
import { throttle } from '../utils/performance'

const OurSpaces = memo(() => {
  const sectionRef = useRef(null)

  const spaces = [
    {
      id: '01',
      name: 'Podcast Shoots',
      description: 'Multi-format podcast recording, talk shows, interviews, reels-friendly angles.',
      leftImg: '/Snapshots1/18.jpg',
      rightImg: '/Snapshots1/9.jpg'
    },
    {
      id: '02',
      name: 'Product Photoshoots',
      description: 'Clean product frames, ecommerce-ready shots, brand creatives.',
      leftImg: '/Snapshots1/1.jpg',
      rightImg: '/Snapshots1/19.jpg'
    },
    {
      id: '03',
      name: 'Model Photography',
      description: 'Fashion, portfolio shoots, campaign-ready imagery.',
      leftImg: '/Snapshots1/20.jpg',
      rightImg: '/Snapshots1/2.jpg'
    },
    {
      id: '04',
      name: 'Content Creation',
      description: 'Reels, YouTube, brand videos, educational content, creator formats.',
      leftImg: '/Snapshots1/3.jpg',
      rightImg: '/Snapshots1/4.jpg'
    }
  ]

  useEffect(() => {
    const setHolders = Array.from(sectionRef.current?.querySelectorAll('.set-holder') || [])
    if (!setHolders.length) return

    let holderData = []
    let windowHeight = window.innerHeight

    const calculatePositions = () => {
      windowHeight = window.innerHeight
      const scrollY = window.scrollY || window.pageYOffset
      holderData = setHolders.map(holder => {
        const rect = holder.getBoundingClientRect()
        return {
          holder,
          absoluteTop: rect.top + scrollY,
          leftImg: holder.querySelector('.set-img-con.left'),
          rightImg: holder.querySelector('.set-img-con.right')
        }
      })
    }

    // Initial setup and resize listener to cache dimensions
    calculatePositions()
    window.addEventListener('resize', calculatePositions, { passive: true })

    const handleScroll = () => {
      const scrollY = window.scrollY || window.pageYOffset
      const updates = []

      holderData.forEach((data) => {
        const currentRectTop = data.absoluteTop - scrollY
        const scrollProgress = Math.max(0, Math.min(1,
          (windowHeight - currentRectTop) / (windowHeight * 0.8)
        ))

        if (data.leftImg && data.rightImg) {
          const translateX = (1 - scrollProgress) * 40
          const rotate = (1 - scrollProgress) * -5
          updates.push({ leftImg: data.leftImg, rightImg: data.rightImg, translateX, rotate })
        }
      })

      updates.forEach(({ leftImg, rightImg, translateX, rotate }) => {
        leftImg.style.transform = `translate3d(${translateX}vw, 0px, 0px) rotateZ(${rotate}deg)`
        rightImg.style.transform = `translate3d(${-translateX}vw, 0px, 0px) rotateZ(${-rotate}deg)`
      })
    }

    const handleMouseMove = (e) => {
      const images = sectionRef.current?.querySelectorAll('.set-img-con')
      if (!images) return

      const moveX = (e.clientX / window.innerWidth - 0.5) * 10

      images.forEach((img) => {
        const currentTransform = img.style.transform || ''
        const translateMatch = currentTransform.match(/translate3d\(([^,]+)/)
        const rotateMatch = currentTransform.match(/rotateZ\(([^)]+)/)

        const baseTranslate = translateMatch ? translateMatch[1] : '0px'
        const baseRotate = rotateMatch ? rotateMatch[1] : '0deg'

        if (img.classList.contains('left')) {
          img.style.transform = `translate3d(calc(${baseTranslate} + ${moveX}px), 0px, 0px) rotateZ(${baseRotate})`
        } else if (img.classList.contains('right')) {
          img.style.transform = `translate3d(calc(${baseTranslate} + ${-moveX}px), 0px, 0px) rotateZ(${baseRotate})`
        }
      })
    }

    const isMobile = window.matchMedia('(max-width: 768px)').matches
    const throttledScroll = throttle(handleScroll, isMobile ? 33 : 16)
    const throttledMouseMove = throttle(handleMouseMove, isMobile ? 33 : 16)

    // Need requestAnimationFrame for first frame to ensure elements are painted
    requestAnimationFrame(() => {
      calculatePositions();
      handleScroll();
    });

    window.addEventListener('scroll', throttledScroll, { passive: true })
    if (!isMobile) {
      window.addEventListener('mousemove', throttledMouseMove, { passive: true })
    }

    return () => {
      window.removeEventListener('resize', calculatePositions)
      window.removeEventListener('scroll', throttledScroll)
      if (!isMobile) {
        window.removeEventListener('mousemove', throttledMouseMove)
      }
    }
  }, [])

  return (
    <section className="sets-section" ref={sectionRef}>
      <div className="home-title-container">
        <div className="section-title home-horizontal-title left">Our Spaces</div>
      </div>

      <div className="sets-con">
        {spaces.map((space) => (
          <div key={space.id} className="set-holder">
            <div className="set-img-con left">
              <img
                alt={space.name}
                className="set-img"
                loading="lazy"
                decoding="async"
                src={space.leftImg}
                width="400"
                height="500"
                style={{ aspectRatio: '4/5', objectFit: 'cover' }}
              />
            </div>

            <div className="set-text-con">
              <div className="set-name">{space.name}</div>
              <div className="set-divider" />
            </div>

            <div className="set-img-con right">
              <img
                alt={space.name}
                className="set-img"
                loading="lazy"
                decoding="async"
                src={space.rightImg}
                width="400"
                height="500"
                style={{ aspectRatio: '4/5', objectFit: 'cover' }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  )
})

OurSpaces.displayName = 'OurSpaces'

export default OurSpaces
