import { useEffect } from 'react';

const SEO = ({ 
  title = "Studio Rental in Bengaluru | NearBy Studios - Best Rates",
  description = "Looking for affordable studio rental in Bengaluru? NearBy Studios offers premium space for model shoots, podcasts, reels & content creation at best prices.",
  keywords = "studio rental Bengaluru, podcast studio Bengaluru, model shoot studio, content creation studio",
  ogImage = "/logo.webp",
  canonical = "https://www.nearbystudios.in/"
}) => {
  useEffect(() => {
    // Update title
    document.title = title;
    
    // Update meta tags
    const metaTags = {
      'description': description,
      'keywords': keywords,
      'og:title': title,
      'og:description': description,
      'og:image': ogImage,
      'twitter:title': title,
      'twitter:description': description,
      'twitter:image': ogImage
    };
    
    Object.entries(metaTags).forEach(([name, content]) => {
      let meta = document.querySelector(`meta[name="${name}"], meta[property="${name}"]`);
      if (meta) {
        meta.setAttribute('content', content);
      }
    });
    
    // Update canonical
    let link = document.querySelector('link[rel="canonical"]');
    if (link) {
      link.setAttribute('href', canonical);
    }
  }, [title, description, keywords, ogImage, canonical]);
  
  return null;
};

export default SEO;
