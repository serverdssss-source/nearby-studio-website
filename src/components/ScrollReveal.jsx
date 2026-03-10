import { useRef, useMemo, memo } from 'react';
import { motion, useScroll, useTransform, useMotionTemplate } from 'framer-motion';

const toMotionAnchor = (value) => {
  if (value === 'top') return 'start';
  if (value === 'bottom') return 'end';
  if (value === 'center') return 'center';
  return value;
};

const toMotionOffset = (position, fallback = 'end end') => {
  if (!position || typeof position !== 'string') return fallback;
  if (position.includes('bottom-=20%')) return 'start 0.8';
  const parts = position.trim().split(/\s+/);
  if (parts.length !== 2) return fallback;
  const [first, second] = parts;
  return `${toMotionAnchor(first)} ${toMotionAnchor(second)}`;
};

const WordReveal = memo(({
  word,
  index,
  totalWords,
  progress,
  baseOpacity,
  enableBlur,
  blurStrength
}) => {
  const start = totalWords <= 1 ? 0 : index / totalWords;
  const end = Math.min(start + 0.35, 1);
  const opacity = useTransform(progress, [start, end], [baseOpacity, 1]);
  const blur = useTransform(progress, [start, end], [blurStrength, 0]);
  const filter = useMotionTemplate`blur(${blur}px)`;

  return (
    <motion.span
      className="inline-block word"
      style={{
        opacity,
        filter: enableBlur ? filter : undefined,
        willChange: 'opacity, filter'
      }}
    >
      {word}
    </motion.span>
  );
});

WordReveal.displayName = 'WordReveal';

const ScrollReveal = memo(({
  children,
  scrollContainerRef,
  enableBlur = true,
  baseOpacity = 0.1,
  baseRotation = 3,
  blurStrength = 4,
  containerClassName = '',
  textClassName = '',
  rotationEnd = 'bottom bottom',
  wordAnimationEnd = 'bottom bottom'
}) => {
  const containerRef = useRef(null);

  const splitText = useMemo(() => {
    const text = typeof children === 'string' ? children : '';
    return text.split(/(\s+)/);
  }, [children]);

  const nonSpaceWords = useMemo(
    () => splitText.filter((token) => !token.match(/^\s+$/)),
    [splitText]
  );

  const scrollTargetOptions = useMemo(() => {
    const options = { target: containerRef };
    if (scrollContainerRef?.current) {
      options.container = scrollContainerRef;
    }
    return options;
  }, [scrollContainerRef]);

  const { scrollYProgress: rotationProgress } = useScroll({
    ...scrollTargetOptions,
    offset: ['start end', toMotionOffset(rotationEnd)]
  });

  const { scrollYProgress: wordsProgress } = useScroll({
    ...scrollTargetOptions,
    offset: [toMotionOffset('top bottom-=20%', 'start 0.8'), toMotionOffset(wordAnimationEnd)]
  });

  const rotate = useTransform(rotationProgress, [0, 1], [baseRotation, 0]);
  let wordIndex = 0;

  return (
    <motion.h2
      ref={containerRef}
      className={`my-5 ${containerClassName}`}
      style={{ rotate, transformOrigin: '0% 50%' }}
    >
      <p className={`text-[clamp(1.6rem,4vw,3rem)] leading-[1.5] font-semibold ${textClassName}`}>
        {splitText.map((token, index) => {
          if (token.match(/^\s+$/)) return token;
          const currentWordIndex = wordIndex;
          wordIndex += 1;
          return (
            <WordReveal
              key={index}
              word={token}
              index={currentWordIndex}
              totalWords={nonSpaceWords.length}
              progress={wordsProgress}
              baseOpacity={baseOpacity}
              enableBlur={enableBlur}
              blurStrength={blurStrength}
            />
          );
        })}
      </p>
    </motion.h2>
  );
});

ScrollReveal.displayName = 'ScrollReveal';

export default ScrollReveal;
