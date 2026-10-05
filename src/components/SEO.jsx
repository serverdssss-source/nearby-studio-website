import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

const SITE_URL = "https://www.nearbystudio.in";
const SITE_NAME = "Nearby Studio";

const absoluteUrl = (path) => (path.startsWith('http') ? path : `${SITE_URL}${path}`);

const SEO = ({
  title = "Studio Rental in Bengaluru | NearBy Studios - Best Rates",
  description = "Looking for affordable studio rental in Bengaluru? NearBy Studios offers premium space for model shoots, podcasts, reels & content creation at best prices.",
  keywords = "studio rental Bengaluru, podcast studio Bengaluru, model shoot studio, content creation studio",
  ogImage = "/logo.webp",
  canonical,
  type = "website"
}) => {
  const { pathname } = useLocation();
  // Each page canonicalises to itself (lowercase, no trailing slash) unless told otherwise
  const path = pathname === '/' ? '/' : pathname.replace(/\/+$/, '').toLowerCase();
  const url = canonical || absoluteUrl(path);
  const image = absoluteUrl(ogImage);

  const articleSchema = type === 'article' && {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: title.replace(/\s*\|\s*Nearby Studio\s*$/i, ''),
    description,
    image,
    url,
    mainEntityOfPage: url,
    author: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: { "@type": "ImageObject", url: absoluteUrl("/logo.webp") }
    }
  };

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={url} />

      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {articleSchema && (
        <script type="application/ld+json">{JSON.stringify(articleSchema)}</script>
      )}
    </Helmet>
  );
};

export default SEO;
