import { useRef, useEffect, useState, useMemo, memo } from 'react';
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  useMotionValue,
  useVelocity,
  useAnimationFrame
} from 'motion/react';

function useElementWidth(ref) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    // Async measure to avoid blocking paint.
    if (typeof ResizeObserver !== 'undefined') {
      let frame;
      const ro = new ResizeObserver(entries => {
        const entry = entries[0];
        const next = entry?.contentRect?.width ?? 0;
        setWidth(prev => (prev === next ? prev : next));
      });
      ro.observe(node);
      frame = requestAnimationFrame(() => {
        const next = node.getBoundingClientRect?.().width ?? 0;
        setWidth(prev => (prev === next ? prev : next));
      });
      return () => {
        ro.disconnect();
        if (frame) cancelAnimationFrame(frame);
      };
    }

    const updateWidth = () => {
      const next = node.offsetWidth || 0;
      setWidth(prev => (prev === next ? prev : next));
    };
    updateWidth();
    window.addEventListener('resize', updateWidth, { passive: true });
    return () => window.removeEventListener('resize', updateWidth);
  }, [ref]);

  return width;
}

export const ScrollVelocity = memo(({
  scrollContainerRef,
  texts = [],
  velocity = 100,
  className = '',
  damping = 50,
  stiffness = 400,
  numCopies = 6,
  velocityMapping = { input: [0, 1000], output: [0, 5] },
  parallaxClassName,
  scrollerClassName,
  parallaxStyle,
  scrollerStyle
}) => {
  function VelocityText({
    children,
    baseVelocity = velocity,
    scrollContainerRef,
    className = '',
    damping,
    stiffness,
    numCopies,
    velocityMapping,
    parallaxClassName,
    scrollerClassName,
    parallaxStyle,
    scrollerStyle
  }) {
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

    useEffect(() => {
      if (typeof window === 'undefined' || !window.matchMedia) return;
      const media = window.matchMedia('(prefers-reduced-motion: reduce)');
      const handleChange = () => setPrefersReducedMotion(media.matches);
      handleChange();
      media.addEventListener('change', handleChange);
      return () => media.removeEventListener('change', handleChange);
    }, []);

    const baseX = useMotionValue(0);
    const scrollOptions = scrollContainerRef ? { container: scrollContainerRef } : {};
    const { scrollY } = useScroll(scrollOptions);
    const scrollVelocity = useVelocity(scrollY);
    const smoothVelocity = useSpring(scrollVelocity, {
      damping: damping ?? 50,
      stiffness: stiffness ?? 400
    });
    const velocityFactor = useTransform(
      smoothVelocity,
      velocityMapping?.input || [0, 1000],
      velocityMapping?.output || [0, 5],
      { clamp: false }
    );

    const copyRef = useRef(null);
    const parallaxRef = useRef(null);
    const copyWidth = useElementWidth(copyRef);
    const containerWidth = useElementWidth(parallaxRef);

    function wrap(min, max, v) {
      const range = max - min;
      const mod = (((v - min) % range) + range) % range;
      return mod + min;
    }

    const x = useTransform(baseX, v => {
      if (copyWidth === 0) return '0px';
      return `${wrap(-copyWidth, 0, v)}px`;
    });

    const directionFactor = useRef(1);
    useAnimationFrame((t, delta) => {
      if (prefersReducedMotion) return;
      let moveBy = directionFactor.current * baseVelocity * (delta / 1000);

      if (velocityFactor.get() < 0) {
        directionFactor.current = -1;
      } else if (velocityFactor.get() > 0) {
        directionFactor.current = 1;
      }

      moveBy += directionFactor.current * moveBy * velocityFactor.get();
      baseX.set(baseX.get() + moveBy);
    });

    // Ensure enough repeated copies to avoid visible gaps/restarts on any viewport width.
    const repeatCount = useMemo(() => {
      const minimum = Math.max(2, numCopies || 2);
      if (!copyWidth || !containerWidth) return minimum;
      return Math.max(minimum, Math.ceil(containerWidth / copyWidth) + 2);
    }, [numCopies, copyWidth, containerWidth]);

    const spans = useMemo(
      () =>
        Array.from({ length: repeatCount }).map((_, index) => (
          <span className={`flex-shrink-0 ${className}`} ref={index === 0 ? copyRef : null} key={index}>
            {children}
          </span>
        )),
      [className, children, repeatCount]
    );

    return (
      <div ref={parallaxRef} className={`${parallaxClassName} relative overflow-hidden`} style={parallaxStyle}>
        <motion.div
          className={`${scrollerClassName} flex whitespace-nowrap text-center font-sans font-bold tracking-[-0.02em] text-[#f5f5f3]/70 uppercase`}
          style={{ x, fontSize: 'var(--scroll-velocity-font-size, 2.5rem)', ...scrollerStyle }}
        >
          {spans}
        </motion.div>
      </div>
    );
  }

  return (
    <section className="scroll-velocity-root">
      {texts.map((text, index) => (
        <div className="scroll-velocity-row" key={index}>
          <VelocityText
            className={className}
            baseVelocity={index % 2 !== 0 ? -velocity : velocity}
            scrollContainerRef={scrollContainerRef}
            damping={damping}
            stiffness={stiffness}
            numCopies={numCopies}
            velocityMapping={velocityMapping}
            parallaxClassName={parallaxClassName}
            scrollerClassName={scrollerClassName}
            parallaxStyle={parallaxStyle}
            scrollerStyle={scrollerStyle}
          >
            {text}
          </VelocityText>
        </div>
      ))}
    </section>
  );
});

ScrollVelocity.displayName = 'ScrollVelocity';

export default ScrollVelocity;
