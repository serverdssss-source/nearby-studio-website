import React from 'react';
import { generateBreadcrumbSchema } from '../utils/seoConfig';
import './Breadcrumb.css';

/**
 * SEO-Optimized Breadcrumb Component
 * Includes Schema.org markup for search engines
 */
const Breadcrumb = ({ items }) => {
  // Generate schema markup
  const schema = generateBreadcrumbSchema(items);

  return (
    <>
      {/* Schema Markup */}
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>

      {/* Visual Breadcrumb */}
      <nav aria-label="Breadcrumb" className="breadcrumb-nav">
        <ol className="breadcrumb-list">
          {items.map((item, index) => (
            <li key={index} className="breadcrumb-item">
              {index < items.length - 1 ? (
                <>
                  <a href={item.url} className="breadcrumb-link">
                    {item.name}
                  </a>
                  <span className="breadcrumb-separator" aria-hidden="true">
                    /
                  </span>
                </>
              ) : (
                <span className="breadcrumb-current" aria-current="page">
                  {item.name}
                </span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
};

export default Breadcrumb;

// Example usage:
// <Breadcrumb items={[
//   { name: 'Home', url: '/' },
//   { name: 'Services', url: '/services' },
//   { name: 'Podcast Studio', url: '/podcast-studio' }
// ]} />
