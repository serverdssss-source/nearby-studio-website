import { useEffect, useRef, useState, memo } from 'react'
import './Hero.css'

const Hero = memo(() => {
  const videoRef = useRef(null)
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
      { rootMargin: '200px 0px' }
    )

    observer.observe(section)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const video = videoRef.current
    if (!video || !shouldLoadVideo) return

    const playVideo = async () => {
      try {
        video.muted = true
        await video.play()
      } catch (error) {
        document.addEventListener('click', () => {
          video.play().catch(() => { })
        }, { once: true })
      }
    }

    if (video.readyState >= 3) {
      playVideo()
    } else {
      video.addEventListener('loadeddata', playVideo, { once: true })
    }
  }, [shouldLoadVideo])

  return (
    <div className="hero-section" ref={sectionRef}>
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        className="hero-video object-contain"
        preload="none"
        webkit-playsinline="true"
      >
        {shouldLoadVideo && (
          <source src="/Nearby studio_Studio tour 1.mp4" type="video/mp4" />
        )}
      </video>
    </div>
  )
})

Hero.displayName = 'Hero'

export default Hero
