'use client';

import React from 'react';
import { ScrollChoreography } from '@/components/ui/scroll-choreography';
import { MeshGradient } from '@paper-design/shaders-react';

const choreographyImages = {
  topLeft:
    'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?q=80&w=2070&auto=format&fit=crop',
  // Top Right (Hero - expands to fullscreen): Lush agricultural crop field / harvest
  topRight:
    'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=2070&auto=format&fit=crop',
  bottomLeft:
    'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?q=80&w=2069&auto=format&fit=crop',
  // Bottom Right:
  bottomRight:
    'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?q=80&w=2070&auto=format&fit=crop',
};

export const FinalCtaSection: React.FC = () => {
  return (
    <section
      id="experience"
      style={{
        position: 'relative',
        width: '100%',
        backgroundColor: '#1E1510',
        color: '#f7f1e5',
        overflow: 'visible',
      }}
    >
      {/* Mesh Gradient Transition from Tech Section (#EADBC8) to Experience Section (#1E1510) */}
      <div
        className="relative w-full overflow-hidden pointer-events-none"
        style={{
          height: 'clamp(220px, 32vh, 440px)',
          width: '100%',
          backgroundColor: '#1E1510',
        }}
      >
        {/* Underlying linear gradient base */}
        <div
          className="absolute inset-0 w-full h-full"
          style={{
            background: 'linear-gradient(to bottom, #EADBC8 0%, #1E1510 100%)',
          }}
        />

        {/* Animated Mesh Gradient with soft alpha mask feathering at top and bottom */}
        <div
          className="absolute inset-0 w-full h-full"
          style={{
            WebkitMaskImage:
              'linear-gradient(to bottom, transparent 0%, black 25%, black 75%, transparent 100%)',
            maskImage:
              'linear-gradient(to bottom, transparent 0%, black 25%, black 75%, transparent 100%)',
          }}
        >
          <MeshGradient
            width={1280}
            height={720}
            colors={['#1e1510', '#eadbc8', '#1e1510', '#eadbc8']}
            distortion={0.8}
            swirl={0.1}
            grainMixer={0}
            grainOverlay={0}
            speed={1}
            style={{
              width: '100%',
              height: '100%',
            }}
          />
        </div>

        {/* Top Edge seamless feathering into Tech Section (#EADBC8) */}
        <div
          className="absolute top-0 left-0 right-0 pointer-events-none z-10"
          style={{
            height: '40%',
            background:
              'linear-gradient(to bottom, #EADBC8 0%, rgba(234, 219, 200, 0.75) 40%, rgba(234, 219, 200, 0) 100%)',
          }}
        />

        {/* Bottom Edge seamless feathering into Experience Section (#1E1510) */}
        <div
          className="absolute bottom-0 left-0 right-0 pointer-events-none z-10"
          style={{
            height: '40%',
            background:
              'linear-gradient(to top, #1E1510 0%, rgba(30, 21, 16, 0.75) 40%, rgba(30, 21, 16, 0) 100%)',
          }}
        />
      </div>

      {/* Scroll Choreography Component (Dark Brown Background, Zero Cursor Grid) */}
      <ScrollChoreography images={choreographyImages} />
    </section>
  );
};

export default FinalCtaSection;

