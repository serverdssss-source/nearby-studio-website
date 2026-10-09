import React from 'react';

// Plain <img> (no intersection observer) so the prerendered HTML carries the image and alt text
const BlogImage = ({ src, alt, width, height, priority = false }) => (
  <figure className="blog-figure">
    <img
      src={encodeURI(src)}
      alt={alt}
      width={width}
      height={height}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
    />
  </figure>
);

export default BlogImage;
