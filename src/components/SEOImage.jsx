import React, { useState, useEffect, useRef } from 'react';

/**
 * SEO-Optimized Image Component with Lazy Loading
 * Automatically adds proper alt tags, lazy loading, and responsive images
 */
const SEOImage = ({ 
  src, 
  alt, 
  title,
  width,
  height,
  className = '',
  loading = 'lazy',
  priority = false
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    if (priority) {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '50px'
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      if (imgRef.current) {
        observer.unobserve(imgRef.current);
      }
    };
  }, [priority]);

  return (
    <div 
      ref={imgRef}
      className={`seo-image-wrapper ${className}`}
      style={{ 
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: '#f0f0f0'
      }}
    >
      {(isInView || priority) && (
        <img
          src={src}
          alt={alt}
          title={title || alt}
          width={width}
          height={height}
          loading={priority ? 'eager' : loading}
          onLoad={() => setIsLoaded(true)}
          style={{
            width: '100%',
            height: 'auto',
            display: 'block',
            opacity: isLoaded ? 1 : 0,
            transition: 'opacity 0.3s ease-in-out'
          }}
        />
      )}
      {!isLoaded && (
        <div 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: '#e0e0e0',
            animation: 'pulse 1.5s ease-in-out infinite'
          }}
        />
      )}
    </div>
  );
};

// Image Alt Text Generator for SEO
export const generateAltText = (imageName, context = '') => {
  const cleanName = imageName
    .replace(/\.(jpg|jpeg|png|webp|gif)$/i, '')
    .replace(/[-_]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  
  const contextPrefix = context ? `${context} - ` : '';
  return `${contextPrefix}${cleanName} at NearBy Studios Bengaluru`;
};

// Image SEO Keywords
export const imageKeywords = {
  studio: 'studio rental Bengaluru, professional studio space',
  podcast: 'podcast studio Bengaluru, recording studio',
  model: 'model shoot studio, fashion photography Bengaluru',
  content: 'content creation studio, reels studio Bengaluru',
  product: 'product photography studio, commercial studio',
  setup: 'studio setup, professional lighting Bengaluru'
};

export default SEOImage;
