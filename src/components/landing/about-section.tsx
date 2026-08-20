'use client';

import React from 'react';
import MaskedHeading from '@/components/react-bits/MaskedHeading';
import CursorGrid from '@/components/react-bits/CursorGrid';
import { CircularTestimonials, Testimonial } from '@/components/ui/circular-testimonials';

const teamMembers: Testimonial[] = [
  {
    name: 'Shauryaditya Pratap Singh',
    designation: 'Backend Architect & Design Lead',
    quote:
      'Architecting core backend telemetry pipelines, IoT data layers, and API connections while providing the primary design language of FasalMitra. Better at Valorant than Faraz Athar.',
    src: '/images/shauryaditya.jpg',
  },
  {
    name: 'Faraz Athar',
    designation: 'Frontend Designer & UI/UX Specialist',
    quote:
      'Responsible for creating modern, high-fidelity, and interactive UI/UX experiences that capture attention, feel alive, and make complex agronomy effortless. The IGL.',
    src: '/images/faraz.jpg',
  },
  {
    name: 'Shauryaditya & Faraz',
    designation: 'Co-Founders & High School Builders',
    quote:
      'Just two high school kids trying to code our way through the world, learn to build new things, and solve real problems to help the world.',
    src: '/images/team-duo.jpg',
  },
];

export const AboutSection: React.FC = () => {
  return (
    <section
      id="about"
      style={{
        position: 'relative',
        width: '100%',
        minHeight: '100vh',
        backgroundColor: '#EADBC8',
        background: '#EADBC8',
        color: '#14160C',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'clamp(80px, 11vh, 140px) clamp(20px, 5vw, 60px)',
        overflow: 'hidden',
        boxSizing: 'border-box',
      }}
    >
      {/* Background Interactive Cursor Grid (Subtle Earthen Tone) */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 0,
          WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 30px, black calc(100% - 30px), transparent 100%)',
          maskImage: 'linear-gradient(to bottom, transparent 0%, black 30px, black calc(100% - 30px), transparent 100%)',
        }}
      >
        <CursorGrid
          cellSize={64}
          color="#5C5415"
          radius={160}
          falloff="smooth"
          holdTime={300}
          fadeDuration={700}
          lineWidth={1.0}
          maxOpacity={0.38}
          fillOpacity={0.06}
          gridOpacity={0.035}
          cellRadius={2}
          clickPulse={true}
          pulseSpeed={550}
        />
      </div>

      {/* Content Column */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          maxWidth: '1120px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: 'clamp(28px, 4.5vh, 48px)',
        }}
      >
        {/* Subtitle tag */}
        <span
          style={{
            fontFamily: '"Orbit Sans", Arial, Helvetica, sans-serif',
            fontSize: 'clamp(11px, 0.9vw, 14px)',
            fontWeight: 700,
            letterSpacing: '0.45em',
            textTransform: 'uppercase',
            color: '#898121',
            opacity: 0.9,
            marginBottom: '-12px',
          }}
        >
          FasalMitra • The Builders
        </span>

        {/* Central Masked Heading (Text clipped with Soil Furrows) */}
        <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
          <MaskedHeading
            text="ABOUT US"
            src="/images/soil-texture.jpg"
            fillScale={1.3}
            parallax={22}
            drift={14}
            reveal="rise"
            trigger="view"
            duration={1.2}
            stagger={0.08}
            align="center"
            weight={900}
            tracking={0.06}
            lineHeight={1.02}
            textScale={0.12}
            style={{
              fontFamily: '"Orbit Display", "Times New Roman", Times, serif',
              textTransform: 'uppercase',
            }}
          />
        </div>

        {/* Circular 3D Perspective Testimonials */}
        <div style={{ width: '100%', marginTop: 'clamp(8px, 1.5vh, 24px)' }}>
          <CircularTestimonials
            testimonials={teamMembers}
            autoplay={false}
            colors={{
              name: '#14160C',
              designation: '#898121',
              testimony: '#1A1807',
              arrowBackground: '#14160C',
              arrowForeground: '#F7F1E5',
              arrowHoverBackground: '#E7B10A',
            }}
          />
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
