'use client';

import React, {
  useEffect,
  useRef,
  useState,
  useMemo,
  useCallback,
} from 'react';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

export interface Testimonial {
  quote: string;
  name: string;
  designation: string;
  src: string;
}

export interface Colors {
  name?: string;
  designation?: string;
  testimony?: string;
  arrowBackground?: string;
  arrowForeground?: string;
  arrowHoverBackground?: string;
}

export interface FontSizes {
  name?: string;
  designation?: string;
  quote?: string;
}

export interface CircularTestimonialsProps {
  testimonials: Testimonial[];
  autoplay?: boolean;
  colors?: Colors;
  fontSizes?: FontSizes;
}

function calculateGap(width: number) {
  const minWidth = 1024;
  const maxWidth = 1456;
  const minGap = 60;
  const maxGap = 86;
  if (width <= minWidth) return minGap;
  if (width >= maxWidth)
    return Math.max(minGap, maxGap + 0.06018 * (width - maxWidth));
  return minGap + (maxGap - minGap) * ((width - minWidth) / (maxWidth - minWidth));
}

export const CircularTestimonials = ({
  testimonials,
  autoplay = false,
  colors = {},
  fontSizes = {},
}: CircularTestimonialsProps) => {
  // Color & font config
  const colorName = colors.name ?? '#14160C';
  const colorDesignation = colors.designation ?? '#898121';
  const colorTestimony = colors.testimony ?? '#1A1807';
  const colorArrowBg = colors.arrowBackground ?? '#14160C';
  const colorArrowFg = colors.arrowForeground ?? '#F7F1E5';
  const colorArrowHoverBg = colors.arrowHoverBackground ?? '#E7B10A';
  const fontSizeName = fontSizes.name ?? 'clamp(1.5rem, 2.2vw, 2.1rem)';
  const fontSizeDesignation = fontSizes.designation ?? 'clamp(0.85rem, 1vw, 1.05rem)';
  const fontSizeQuote = fontSizes.quote ?? 'clamp(0.98rem, 1.15vw, 1.15rem)';

  // State
  const [activeIndex, setActiveIndex] = useState(0);
  const [hoverPrev, setHoverPrev] = useState(false);
  const [hoverNext, setHoverNext] = useState(false);
  const [containerWidth, setContainerWidth] = useState(1200);

  const imageContainerRef = useRef<HTMLDivElement>(null);
  const autoplayIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const testimonialsLength = useMemo(() => testimonials.length, [testimonials]);
  const activeTestimonial = useMemo(
    () => testimonials[activeIndex],
    [activeIndex, testimonials]
  );

  // Responsive gap calculation
  useEffect(() => {
    function handleResize() {
      if (imageContainerRef.current) {
        setContainerWidth(imageContainerRef.current.offsetWidth);
      }
    }
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Autoplay
  useEffect(() => {
    if (autoplay) {
      autoplayIntervalRef.current = setInterval(() => {
        setActiveIndex((prev) => (prev + 1) % testimonialsLength);
      }, 6500);
    }
    return () => {
      if (autoplayIntervalRef.current) clearInterval(autoplayIntervalRef.current);
    };
  }, [autoplay, testimonialsLength]);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [activeIndex, testimonialsLength]);

  // Navigation handlers
  const handleNext = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % testimonialsLength);
    if (autoplayIntervalRef.current) clearInterval(autoplayIntervalRef.current);
  }, [testimonialsLength]);

  const handlePrev = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + testimonialsLength) % testimonialsLength);
    if (autoplayIntervalRef.current) clearInterval(autoplayIntervalRef.current);
  }, [testimonialsLength]);

  // Compute transforms for each image (always show 3: left, center, right)
  function getImageStyle(index: number): React.CSSProperties {
    const gap = calculateGap(containerWidth);
    const maxStickUp = gap * 0.75;
    const isActive = index === activeIndex;
    const isLeft = (activeIndex - 1 + testimonialsLength) % testimonialsLength === index;
    const isRight = (activeIndex + 1) % testimonialsLength === index;
    if (isActive) {
      return {
        zIndex: 3,
        opacity: 1,
        pointerEvents: 'auto',
        transform: `translateX(0px) translateY(0px) scale(1) rotateY(0deg)`,
        transition: 'all 0.8s cubic-bezier(.4,2,.3,1)',
      };
    }
    if (isLeft) {
      return {
        zIndex: 2,
        opacity: 0.88,
        pointerEvents: 'auto',
        transform: `translateX(-${gap}px) translateY(-${maxStickUp}px) scale(0.85) rotateY(15deg)`,
        transition: 'all 0.8s cubic-bezier(.4,2,.3,1)',
      };
    }
    if (isRight) {
      return {
        zIndex: 2,
        opacity: 0.88,
        pointerEvents: 'auto',
        transform: `translateX(${gap}px) translateY(-${maxStickUp}px) scale(0.85) rotateY(-15deg)`,
        transition: 'all 0.8s cubic-bezier(.4,2,.3,1)',
      };
    }
    // Hide all other images
    return {
      zIndex: 1,
      opacity: 0,
      pointerEvents: 'none',
      transform: `translateX(0px) translateY(0px) scale(0.7)`,
      transition: 'all 0.8s cubic-bezier(.4,2,.3,1)',
    };
  }

  // Framer Motion variants for quote
  const quoteVariants = {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -16 },
  };

  return (
    <div className="circular-testimonials-root">
      <div className="testimonial-grid">
        {/* Images Perspective 3D Stack */}
        <div className="image-container" ref={imageContainerRef}>
          {testimonials.map((testimonial, index) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={testimonial.src}
              src={testimonial.src}
              alt={testimonial.name}
              className="testimonial-image"
              data-index={index}
              style={getImageStyle(index)}
              onClick={() => setActiveIndex(index)}
            />
          ))}
        </div>

        {/* Content Box */}
        <div className="testimonial-content">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              variants={quoteVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.35, ease: 'easeInOut' }}
            >
              <h3
                className="name"
                style={{
                  color: colorName,
                  fontSize: fontSizeName,
                  fontFamily: '"Orbit Display", "Times New Roman", Times, serif',
                  letterSpacing: '0.02em',
                  marginBottom: '0.35rem',
                  fontWeight: 900
                }}
              >
                {activeTestimonial.name}
              </h3>
              <p
                className="designation"
                style={{
                  color: colorDesignation,
                  fontSize: fontSizeDesignation,
                  fontFamily: '"Orbit Sans", Arial, sans-serif',
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  marginBottom: '1.4rem'
                }}
              >
                {activeTestimonial.designation}
              </p>
              <motion.p
                className="quote"
                style={{
                  color: colorTestimony,
                  fontSize: fontSizeQuote,
                  fontFamily: '"Orbit Sans", -apple-system, sans-serif',
                  lineHeight: 1.85,
                  fontWeight: 600,
                  textAlign: 'justify',
                  textJustify: 'inter-word'
                }}
              >
                {activeTestimonial.quote.split(' ').map((word, i) => (
                  <motion.span
                    key={i}
                    initial={{
                      filter: 'blur(8px)',
                      opacity: 0,
                      y: 4,
                    }}
                    animate={{
                      filter: 'blur(0px)',
                      opacity: 1,
                      y: 0,
                    }}
                    transition={{
                      duration: 0.22,
                      ease: 'easeInOut',
                      delay: 0.016 * i,
                    }}
                    style={{ display: 'inline-block' }}
                  >
                    {word}&nbsp;
                  </motion.span>
                ))}
              </motion.p>
            </motion.div>
          </AnimatePresence>

          <div className="arrow-buttons">
            <button
              className="arrow-button prev-button"
              onClick={handlePrev}
              style={{
                backgroundColor: hoverPrev ? colorArrowHoverBg : colorArrowBg,
                color: hoverPrev ? '#14160C' : colorArrowFg
              }}
              onMouseEnter={() => setHoverPrev(true)}
              onMouseLeave={() => setHoverPrev(false)}
              aria-label="Previous builder"
            >
              <FaArrowLeft size={16} />
            </button>
            <button
              className="arrow-button next-button"
              onClick={handleNext}
              style={{
                backgroundColor: hoverNext ? colorArrowHoverBg : colorArrowBg,
                color: hoverNext ? '#14160C' : colorArrowFg
              }}
              onMouseEnter={() => setHoverNext(true)}
              onMouseLeave={() => setHoverNext(false)}
              aria-label="Next builder"
            >
              <FaArrowRight size={16} />
            </button>
            <div className="counter-dots">
              {testimonials.map((_, idx) => (
                <span
                  key={idx}
                  onClick={() => setActiveIndex(idx)}
                  className={`dot ${idx === activeIndex ? 'active' : ''}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .circular-testimonials-root {
          width: 100%;
          max-width: 68rem;
          padding: 1.5rem;
          margin: 0 auto;
        }
        .testimonial-grid {
          display: grid;
          gap: clamp(2.5rem, 5vw, 4.5rem);
          align-items: center;
        }
        .image-container {
          position: relative;
          width: 100%;
          height: clamp(18rem, 24vw, 24rem);
          perspective: 1000px;
        }
        .testimonial-image {
          position: absolute;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center 25%;
          border-radius: 1.75rem;
          box-shadow: 0 16px 36px rgba(45, 35, 12, 0.22), 0 4px 12px rgba(0,0,0,0.1);
          border: 4px solid #FFFFFF;
          cursor: pointer;
        }
        .testimonial-content {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          min-height: 220px;
        }
        .arrow-buttons {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding-top: 2.2rem;
        }
        .arrow-button {
          width: 3.2rem;
          height: 3.2rem;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.25s ease;
          border: none;
          box-shadow: 0 6px 18px rgba(0, 0, 0, 0.18);
        }
        .counter-dots {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-left: 1rem;
        }
        .dot {
          width: 8px;
          height: 8px;
          border-radius: 9999px;
          background: rgba(92, 84, 21, 0.25);
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .dot.active {
          width: 24px;
          background: #5C5415;
        }
        @media (min-width: 860px) {
          .testimonial-grid {
            grid-template-columns: 1fr 1.15fr;
          }
        }
      `}</style>
    </div>
  );
};

export default CircularTestimonials;
