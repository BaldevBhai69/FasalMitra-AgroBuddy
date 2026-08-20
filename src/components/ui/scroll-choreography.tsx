'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import { motion, useScroll, useSpring, useTransform } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface ScrollChoreographyProps {
  className?: string;
  images: {
    topLeft: string;
    topRight: string;
    bottomLeft: string;
    bottomRight: string;
  };
}

export function ScrollChoreography({
  className,
  images,
}: ScrollChoreographyProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 28,
    mass: 0.8,
    restDelta: 0.0001,
  });

  // Balanced positions relative to viewport center
  const xLeft = '-22vw';
  const xRight = '22vw';
  const yTop = '-15vh';
  const yBottom = '15vh';

  // Phase 1: 0 - 0.3 (Diagonal movement)
  // Phase 2: 0.35 - 0.65 (Stack alignment to center)
  // Phase 3: 0.7 - 0.9 (Top Right expands to full screen)

  // Top Left -> moves to Bottom Left, then to Center
  const tlX = useTransform(smoothProgress, [0, 0.3, 0.35, 0.65, 1], [xLeft, xLeft, xLeft, '0vw', '0vw']);
  const tlY = useTransform(smoothProgress, [0, 0.3, 0.35, 0.65, 1], [yTop, yBottom, yBottom, '0vh', '0vh']);

  // Bottom Right -> moves to Top Right, then to Center
  const brX = useTransform(smoothProgress, [0, 0.3, 0.35, 0.65, 1], [xRight, xRight, xRight, '0vw', '0vw']);
  const brY = useTransform(smoothProgress, [0, 0.3, 0.35, 0.65, 1], [yBottom, yTop, yTop, '0vh', '0vh']);

  // Bottom Left -> stays, then moves to Center
  const blX = useTransform(smoothProgress, [0, 0.3, 0.35, 0.65, 1], [xLeft, xLeft, xLeft, '0vw', '0vw']);
  const blY = useTransform(smoothProgress, [0, 0.3, 0.35, 0.65, 1], [yBottom, yBottom, yBottom, '0vh', '0vh']);

  // Top Right (Hero) -> stays, then moves to Center, then expands
  const trX = useTransform(smoothProgress, [0, 0.3, 0.35, 0.65, 1], [xRight, xRight, xRight, '0vw', '0vw']);
  const trY = useTransform(smoothProgress, [0, 0.3, 0.35, 0.65, 1], [yTop, yTop, yTop, '0vh', '0vh']);

  // Top Right (Hero) scaling/expansion properties
  const heroWidth = useTransform(smoothProgress, [0.65, 0.7, 0.92, 1], ['42vw', '42vw', '100vw', '100vw']);
  const heroHeight = useTransform(smoothProgress, [0.65, 0.7, 0.92, 1], ['28vh', '28vh', '100vh', '100vh']);
  const heroRadius = useTransform(smoothProgress, [0.75, 0.92], ['1.5rem', '0rem']);

  // Opacity fading for images underneath the hero as it expands
  const underImagesOpacity = useTransform(smoothProgress, [0.72, 0.85], [1, 0]);

  // CTA Button animations appearing when the hero expands to full screen
  const ctaOpacity = useTransform(smoothProgress, [0.85, 0.96], [0, 1]);
  const ctaScale = useTransform(smoothProgress, [0.85, 0.96], [0.85, 1]);
  const ctaPointerEvents = useTransform(smoothProgress, (val) => (val > 0.88 ? 'auto' : 'none'));

  const baseImageClasses =
    'absolute left-1/2 top-1/2 w-[42vw] h-[28vh] overflow-hidden bg-[#1b140e] shadow-2xl will-change-transform rounded-3xl border border-white/10';

  return (
    <div ref={containerRef} className={cn('relative h-[300vh] w-full bg-[#1E1510]', className)}>
      <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center">
        <div className="relative w-full h-full flex items-center justify-center">
          {/* Top Left Image */}
          <motion.div
            style={{
              x: tlX,
              y: tlY,
              translateX: '-50%',
              translateY: '-50%',
              opacity: underImagesOpacity,
            }}
            className={cn(baseImageClasses, 'z-10')}
          >
            <img src={images.topLeft} alt="Agronomy Telemetry" className="h-full w-full object-cover" />
          </motion.div>

          {/* Bottom Right Image */}
          <motion.div
            style={{
              x: brX,
              y: brY,
              translateX: '-50%',
              translateY: '-50%',
              opacity: underImagesOpacity,
            }}
            className={cn(baseImageClasses, 'z-20')}
          >
            <img src={images.bottomRight} alt="Cultivation & Harvest" className="h-full w-full object-cover" />
          </motion.div>

          {/* Bottom Left Image */}
          <motion.div
            style={{
              x: blX,
              y: blY,
              translateX: '-50%',
              translateY: '-50%',
              opacity: underImagesOpacity,
            }}
            className={cn(baseImageClasses, 'z-30')}
          >
            <img src={images.bottomLeft} alt="Field Sensors" className="h-full w-full object-cover" />
          </motion.div>

          {/* Top Right Image (Hero - expands to fullscreen) */}
          <motion.div
            style={{
              x: trX,
              y: trY,
              translateX: '-50%',
              translateY: '-50%',
              width: heroWidth,
              height: heroHeight,
              borderRadius: heroRadius,
            }}
            className={cn(baseImageClasses, 'z-40 origin-center bg-black/40 border-none shadow-none')}
          >
            <img src={images.topRight} alt="FasalMitra Hero Landscape" className="h-full w-full object-cover" />
            {/* Subtle dark cinematic vignette overlay */}
            <motion.div
              style={{ opacity: ctaOpacity }}
              className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/40 to-black/60 pointer-events-none"
            />
          </motion.div>

          {/* Central Prominent CTA Button on Fullscreen Hero */}
          <motion.div
            style={{
              opacity: ctaOpacity,
              scale: ctaScale,
              pointerEvents: ctaPointerEvents,
            }}
            className="absolute z-50 flex flex-col items-center justify-center text-center p-6"
          >
            <Link
              href="/dashboard"
              className="group relative inline-flex items-center justify-center px-10 py-5 sm:px-14 sm:py-6 text-xl sm:text-2xl md:text-3xl font-bold tracking-wide text-[#14160C] bg-[#E7B10A] hover:bg-[#F2C226] rounded-full shadow-[0_16px_50px_rgba(0,0,0,0.7),0_0_40px_rgba(231,177,10,0.45)] transition-all duration-300 transform hover:scale-105 active:scale-95 overflow-hidden"
              style={{ fontFamily: '"Orbit Display", "Times New Roman", Times, serif' }}
            >
              {/* Button Shimmer / Ripple Glow */}
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />

              <span className="relative flex items-center gap-4">
                <span>Enter Dashboard</span>
                <svg
                  className="w-7 h-7 sm:w-8 sm:h-8 transition-transform duration-300 group-hover:translate-x-2"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.5}
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default ScrollChoreography;
