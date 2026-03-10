import { memo, useMemo } from 'react';
import ScrollVelocity from './ScrollVelocity';
import './Services.css';

const Services = memo(() => {
  const primaryLine = useMemo(
    () => [
      'Photoshoots',
      'Model Photography',
      'Content Creation',
      'Green Screen Shoots',
      'Podcasts',
      'Product Shoots'
    ],
    []
  );

  const secondaryLine = useMemo(
    () => [
      'Ad Films',
      'Product Films',
      'Fashion',
      'Reels & Social',
      'OTT Promos',
      'Brand Promos'
    ],
    []
  );

  const renderLine = (items) => (
    <div className="services-line">
      {items.map((item, index) => (
        <span className="services-tag" key={`${item}-${index}`}>
          {item}
        </span>
      ))}
    </div>
  );

  return (
    <section className="services-marquee">
      <div className="services-marquee__glow services-marquee__glow--left" />
      <div className="services-marquee__glow services-marquee__glow--right" />

      <ScrollVelocity
        texts={[renderLine(primaryLine), renderLine(secondaryLine)]}
        velocity={90}
        numCopies={5}
        className="services-marquee__track"
        parallaxClassName="services-parallax"
        scrollerClassName="services-scroller"
        textClassName="services-text"
      />

      <div className="services-marquee__overlay" />
    </section>
  );
});

Services.displayName = 'Services';

export default Services;
