import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({ 
  title = "Studio Rental in Bengaluru | NearBy Studios - Best Rates",
  description = "Looking for affordable studio rental in Bengaluru? NearBy Studios offers premium space for model shoots, podcasts, reels & content creation at best prices.",
  keywords = "studio rental Bengaluru, podcast studio Bengaluru, model shoot studio, content creation studio",
  ogImage = "/logo.webp",
  canonical = "https://www.nearbystudios.in/",
  type = "website"
}) => {
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={canonical} />
      
      <meta property="og:type" content={type} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
    </Helmet>
  );
};

export default SEO;
