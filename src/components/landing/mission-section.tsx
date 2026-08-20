'use client';

import React from 'react';
import MaskedHeading from '../react-bits/MaskedHeading';
import CursorGrid from '../react-bits/CursorGrid';

export const MissionSection: React.FC = () => {
  return (
    <section
      id="mission"
      className="mission-section"
      style={{
        position: 'relative',
        width: '100%',
        minHeight: '100vh',
        backgroundColor: '#EADBC8',
        background: '#EADBC8',
        color: '#1E2010',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'clamp(80px, 12vh, 160px) clamp(24px, 6vw, 80px)',
        overflow: 'hidden',
        boxSizing: 'border-box'
      }}
    >
      {/* Background Interactive Cursor Grid (Subtle Earthen Tone) */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 0,
          WebkitMaskImage: 'linear-gradient(to bottom, black calc(100% - 30px), transparent 100%)',
          maskImage: 'linear-gradient(to bottom, black calc(100% - 30px), transparent 100%)',
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
          gap: 'clamp(28px, 4.5vh, 48px)'
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
            marginBottom: '-12px'
          }}
        >
          FasalMitra • AgroBuddy
        </span>

        {/* Central Masked Heading (Text clipped with Soil Furrows) */}
        <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
          <MaskedHeading
            text="OUR MISSION"
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
              textTransform: 'uppercase'
            }}
          />
        </div>

        {/* Central Stage: Dead-Centered Paragraph with Right-Flanked Wiggling Sticker */}
        <div className="mission-center-stage">
          {/* Exactly Centered Squarish Formatted Justified Mission Paragraph */}
          <div className="mission-paragraph-centered">
            <p
              style={{
                fontFamily: '"Orbit Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                fontSize: 'clamp(15px, 1.15vw, 18px)',
                lineHeight: 1.95,
                fontWeight: 600,
                color: '#1A1807',
                margin: 0,
                textAlign: 'justify',
                textJustify: 'inter-word',
                hyphens: 'none',
                letterSpacing: '0.012em'
              }}
            >
              FasalMitra is dedicated to revolutionizing Indian agriculture by placing intelligent,
              hyper-localized agronomy directly into the hands of every farmer. By synthesizing real-time
              IoT soil intelligence, satellite telemetry, and predictive weather forecasting with FAO-56
              irrigation protocols and automated disease diagnosis, we eliminate guesswork from cultivation.
              Our mission is to safeguard vital groundwater reserves, drastically reduce input overheads,
              and deliver equitable, transparent APMC mandi price discovery—transforming every acre into a
              resilient, high-yielding, and financially sovereign harvest for generations to come.
            </p>
          </div>

          {/* Die-Cut Vintage Storybook Farmer Sticker (Flanked to the Right with Gentle Wiggle) */}
          <div className="mission-farmer-sticker-anchor">
            <div className="mission-farmer-sticker">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/farmer-sticker.png"
                alt="Vintage literature illustration sticker of an Indian farmer holding a sickle and wheat stalks"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MissionSection;
