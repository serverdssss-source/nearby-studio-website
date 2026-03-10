import { memo, useState, useEffect, useRef } from 'react';

const OptimizedImage = memo(({ 
  src, 
  alt, 
  className = '', 
  style = {},
  loading = 'lazy',
  decoding = 'async',
  ...props 
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;

    if (img.complete) {
      setIsLoaded(true);
    }
  }, []);

  return (
    <img
      ref={imgRef}
      src={src}
      alt={alt}
      className={className}
      style={{
        ...style,
        opacity: isLoaded ? 1 : 0,
        transition: 'opacity 0.3s ease-in-out',
      }}
      loading={loading}
      decoding={decoding}
      onLoad={() => setIsLoaded(true)}
      {...props}
    />
  );
});

OptimizedImage.displayName = 'OptimizedImage';

export default OptimizedImage;
