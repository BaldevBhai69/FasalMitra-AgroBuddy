'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Lenis from 'lenis';
import MissionSection from '@/components/landing/mission-section';
import AboutSection from '@/components/landing/about-section';
import TechSection from '@/components/landing/tech-section';
import FinalCtaSection from '@/components/landing/final-cta-section';

export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [animActive, setAnimActive] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);

  const stageRef = useRef<HTMLDivElement>(null);
  const flowerRef = useRef<HTMLDivElement>(null);
  const floatWrapRef = useRef<HTMLDivElement>(null);
  const layerBgRef = useRef<HTMLDivElement>(null);
  const layerTopRef = useRef<HTMLDivElement>(null);
  const sizerRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    // Force manual scroll restoration to always start at the Hero section on refresh
    if (typeof window !== 'undefined') {
      if ('scrollRestoration' in window.history) {
        window.history.scrollRestoration = 'manual';
      }
      window.scrollTo(0, 0);
    }

    // 0. Initialize Lenis Smooth Scrolling (Silky-Smooth 60fps Uniform Velocity)
    const lenis = new Lenis({
      lerp: 0.09,
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 0.85,
      touchMultiplier: 1.0,
      infinite: false,
    });

    lenis.scrollTo(0, { immediate: true });

    let lenisRafId = 0;
    function lenisRaf(time: number) {
      lenis.raf(time);
      lenisRafId = requestAnimationFrame(lenisRaf);
    }
    lenisRafId = requestAnimationFrame(lenisRaf);

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 60);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    // 1. Entrance animation cleanup
    const timer = setTimeout(() => {
      setAnimActive(false);
    }, 2200);

    // 2. Mouse morph-reveal trail engine & Pointer float inertia
    const TRAIL_MAX_POINTS = 60;
    const TRAIL_HEAD_R = 140;
    const TRAIL_NOISE_AMP = 44;
    const TRAIL_BLOB_PTS = 24;
    const TRAIL_FADE_SPEED = 0.92;
    const TRAIL_SAMPLE_DIST = 8;

    const stage = stageRef.current;
    const flower = flowerRef.current;
    const layerBg = layerBgRef.current;
    const layerTop = layerTopRef.current;
    const sizer = sizerRef.current;

    if (!stage || !flower || !layerBg || !layerTop) return () => clearTimeout(timer);

    const canvasBg = document.createElement('canvas');
    const ctxBg = canvasBg.getContext('2d');
    const canvasTop = document.createElement('canvas');
    const ctxTop = canvasTop.getContext('2d');

    if (!ctxBg || !ctxTop) return () => clearTimeout(timer);

    let width = 0;
    let height = 0;

    function resizeCanvases() {
      if (!flower) return;
      const rect = flower.getBoundingClientRect();
      if (rect.width > 20 && rect.height > 20) {
        width = Math.floor(rect.width);
        height = Math.floor(rect.height);
        canvasBg.width = width;
        canvasBg.height = height;
        canvasTop.width = width;
        canvasTop.height = height;
      }
    }

    if (sizer) {
      sizer.addEventListener('load', resizeCanvases);
      if (sizer.complete) resizeCanvases();
    }
    window.addEventListener('resize', resizeCanvases);
    setTimeout(resizeCanvases, 100);
    setTimeout(resizeCanvases, 500);
    setTimeout(resizeCanvases, 1500);

    const trailPoints: Array<{ x: number; y: number; r: number; alpha: number; seed: number }> = [];
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let lastSampleX = -9999;
    let lastSampleY = -9999;
    let isHovering = false;
    let headRadius = 0;
    let time = 0;
    let animFrameId: number;

    // Spring Float Inertia
    let floatX = 0;
    let floatY = 0;
    let floatRot = 0;

    const onPointerMove = (e: PointerEvent) => {
      isHovering = true;
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const onPointerEnter = () => {
      isHovering = true;
    };

    const onPointerLeave = () => {
      isHovering = false;
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerenter', onPointerEnter);
    window.addEventListener('pointerleave', onPointerLeave);

    function drawMorphBlob(
      ctx: CanvasRenderingContext2D,
      cx: number,
      cy: number,
      r: number,
      t: number,
      seed: number,
      fillStyle: string
    ) {
      if (r < 2) return;

      const pts: Array<{ x: number; y: number }> = [];
      for (let i = 0; i < TRAIL_BLOB_PTS; i++) {
        const angle = (i / TRAIL_BLOB_PTS) * Math.PI * 2;
        const n1 = Math.sin(angle * 3 + t * 1.4 + seed) * 0.45;
        const n2 = Math.sin(angle * 5 - t * 0.9 + seed * 2.3) * 0.3;
        const n3 = Math.cos(angle * 2 + t * 1.8 + seed * 0.7) * 0.25;
        const noise = (n1 + n2 + n3) * TRAIL_NOISE_AMP * (r / TRAIL_HEAD_R);
        const rad = Math.max(1, r + noise);
        pts.push({
          x: cx + Math.cos(angle) * rad,
          y: cy + Math.sin(angle) * rad,
        });
      }

      ctx.beginPath();
      const mid0x = (pts[0].x + pts[1].x) / 2;
      const mid0y = (pts[0].y + pts[1].y) / 2;
      ctx.moveTo(mid0x, mid0y);

      for (let i = 1; i < pts.length; i++) {
        const next = pts[(i + 1) % pts.length];
        const midX = (pts[i].x + next.x) / 2;
        const midY = (pts[i].y + next.y) / 2;
        ctx.quadraticCurveTo(pts[i].x, pts[i].y, midX, midY);
      }

      const midLastX = (pts[0].x + pts[1].x) / 2;
      const midLastY = (pts[0].y + pts[1].y) / 2;
      ctx.quadraticCurveTo(pts[0].x, pts[0].y, midLastX, midLastY);
      ctx.closePath();

      ctx.fillStyle = fillStyle;
      ctx.fill();
    }

    let isMaskActive = false;

    function renderFrame() {
      animFrameId = requestAnimationFrame(renderFrame);

      // Skip entire frame computation if Hero is scrolled out of viewport
      if (typeof window !== 'undefined' && window.scrollY > window.innerHeight * 0.9) {
        return;
      }

      // 1. POINTER FLOAT PARALLAX PHYSICS ON CENTRAL FLOWER
      const targetFloatX = isHovering ? ((mouseX / window.innerWidth) - 0.5) * 36 : 0;
      const targetFloatY = isHovering ? ((mouseY / window.innerHeight) - 0.5) * 24 : 0;
      const targetFloatRot = isHovering ? ((mouseX / window.innerWidth) - 0.5) * 4.0 : 0;

      floatX += (targetFloatX - floatX) * 0.08;
      floatY += (targetFloatY - floatY) * 0.08;
      floatRot += (targetFloatRot - floatRot) * 0.08;
      const floatWrap = floatWrapRef.current;
      if (floatWrap) {
        floatWrap.style.transform = `translate3d(${floatX.toFixed(2)}px, ${floatY.toFixed(2)}px, 0) rotate(${floatRot.toFixed(2)}deg)`;
      }

      // 2. CHECK SIZE RECT
      if (!flower || !layerBg || !layerTop || !ctxBg || !ctxTop) return;

      const rect = flower.getBoundingClientRect();
      if (width === 0 || height === 0 || Math.abs(rect.width - width) > 4 || Math.abs(rect.height - height) > 4) {
        if (rect.width > 20 && rect.height > 20) {
          width = Math.floor(rect.width);
          height = Math.floor(rect.height);
          canvasBg.width = width;
          canvasBg.height = height;
          canvasTop.width = width;
          canvasTop.height = height;
        }
      }

      if (width === 0 || height === 0) return;

      // 3. MORPH REVEAL TRAIL
      const targetR = isHovering ? TRAIL_HEAD_R : 0;
      headRadius += (targetR - headRadius) * (isHovering ? 0.14 : 0.04);

      const fx = mouseX - rect.left;
      const fy = mouseY - rect.top;

      if (isHovering && headRadius > 5) {
        const dist = Math.hypot(fx - lastSampleX, fy - lastSampleY);
        if (dist > TRAIL_SAMPLE_DIST) {
          trailPoints.unshift({
            x: fx,
            y: fy,
            r: headRadius,
            alpha: 1,
            seed: Math.random() * 100,
          });
          if (trailPoints.length > TRAIL_MAX_POINTS) {
            trailPoints.pop();
          }
          lastSampleX = fx;
          lastSampleY = fy;
        }
      }

      for (let i = trailPoints.length - 1; i >= 0; i--) {
        const pt = trailPoints[i];
        pt.alpha *= TRAIL_FADE_SPEED;
        pt.r *= 0.995;
        if (pt.alpha < 0.01) {
          trailPoints.splice(i, 1);
        }
      }

      time += 0.016;

      if (trailPoints.length === 0 && headRadius < 0.5) {
        if (isMaskActive) {
          layerTop.style.webkitMaskImage = 'linear-gradient(#0000, #0000)';
          layerTop.style.maskImage = 'linear-gradient(#0000, #0000)';
          layerBg.style.webkitMaskImage = 'none';
          layerBg.style.maskImage = 'none';
          isMaskActive = false;
        }
        return;
      }

      isMaskActive = true;

      // BG Canvas: punch holes
      ctxBg.clearRect(0, 0, width, height);
      ctxBg.globalCompositeOperation = 'source-over';
      ctxBg.fillStyle = '#ffffff';
      ctxBg.fillRect(0, 0, width, height);
      ctxBg.globalCompositeOperation = 'destination-out';

      if (isHovering && headRadius > 2) {
        drawMorphBlob(ctxBg, fx, fy, headRadius, time, 42, 'rgba(0,0,0,1)');
      }
      for (let i = 0; i < trailPoints.length; i++) {
        const pt = trailPoints[i];
        drawMorphBlob(ctxBg, pt.x, pt.y, pt.r, time, pt.seed, `rgba(0,0,0,${pt.alpha})`);
      }

      // TOP Canvas: reveal paint
      ctxTop.clearRect(0, 0, width, height);
      ctxTop.globalCompositeOperation = 'source-over';

      if (isHovering && headRadius > 2) {
        drawMorphBlob(ctxTop, fx, fy, headRadius, time, 42, 'rgba(255,255,255,1)');
      }
      for (let i = 0; i < trailPoints.length; i++) {
        const pt = trailPoints[i];
        drawMorphBlob(ctxTop, pt.x, pt.y, pt.r, time, pt.seed, `rgba(255,255,255,${pt.alpha})`);
      }

      const dataUrlBg = canvasBg.toDataURL('image/png');
      const dataUrlTop = canvasTop.toDataURL('image/png');

      layerBg.style.webkitMaskImage = `url(${dataUrlBg})`;
      layerBg.style.maskImage = `url(${dataUrlBg})`;

      layerTop.style.webkitMaskImage = `url(${dataUrlTop})`;
      layerTop.style.maskImage = `url(${dataUrlTop})`;
    }

    animFrameId = requestAnimationFrame(renderFrame);

    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(animFrameId);
      cancelAnimationFrame(lenisRafId);
      lenis.destroy();
      window.removeEventListener('resize', resizeCanvases);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerenter', onPointerEnter);
      window.removeEventListener('pointerleave', onPointerLeave);
    };
  }, []);

  return (
    <>
      <main className="viewport">
        <section ref={stageRef} className={`stage ${animActive ? 'anim' : ''}`} id="home">
          
          {/* Brand Mark SVG */}
          <Link href="#home" className={`brand-mark ${isScrolled ? 'scrolled' : ''}`} aria-label="Orbit Home">
            <svg viewBox="0 0 66 62" fill="none" xmlns="http://www.w3.org/2000/svg">
              <line x1="33" y1="1" x2="33" y2="61" stroke="#f7f1e5" strokeWidth="5" strokeLinecap="square" />
              <line x1="3" y1="31" x2="63" y2="31" stroke="#f7f1e5" strokeWidth="5" strokeLinecap="square" />
              <line x1="11.8" y1="9.8" x2="54.2" y2="52.2" stroke="#f7f1e5" strokeWidth="5" strokeLinecap="square" />
              <line x1="54.2" y1="9.8" x2="11.8" y2="52.2" stroke="#f7f1e5" strokeWidth="5" strokeLinecap="square" />
            </svg>
          </Link>

          {/* Primary Nav */}
          <ul className={`primary-nav ${isScrolled ? 'scrolled' : ''}`}>
            <li className="primary-nav__item primary-nav__item--home">
              <Link href="#home">Home</Link>
            </li>
            <li className="primary-nav__item primary-nav__item--mission">
              <Link href="#mission">Mission</Link>
            </li>
            <li className="primary-nav__item primary-nav__item--about">
              <Link href="#about">About Us</Link>
            </li>
            <li className="primary-nav__item primary-nav__item--tech">
              <Link href="#tech">Tech</Link>
            </li>
          </ul>

          {/* Floating Dashboard CTA Pill */}
          <Link href="/dashboard" className={`secure-pill ${isScrolled ? 'scrolled' : ''}`} id="dashboard-cta">
            Dashboard →
          </Link>

          {/* Wordmark FASALMITRA */}
          <h1 className="orbit-word" id="orbit-title" aria-label="FasalMitra">
            <span className="orbit-word__mask">
              <span className="orbit-word__inner">
                <span className="orbit-word__white">FASAL</span>
                <span className="orbit-word__pink">MITRA</span>
              </span>
            </span>
          </h1>

          {/* Flank Subtitle Labels: AGRO and BUDDY on either side of the flower */}
          <div className="flank-tag flank-tag--left" aria-hidden="true">A G R O</div>
          <div className="flank-tag flank-tag--right" aria-hidden="true">B U D D Y</div>

          {/* Flower Stack (Front and Reveal Lilies) */}
          <div ref={flowerRef} className="flower" id="flower-stack">
            <div ref={floatWrapRef} className="flower__float" id="flower-float">
              <img
                ref={sizerRef}
                className="flower__sizer"
                id="flower-sizer"
                src="https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260808_192942_e1086505-d7da-433b-a59b-8220f4e6c808.png&w=1280&q=85"
                alt=""
                aria-hidden="true"
              />
              <div ref={layerBgRef} className="flower__layer flower__layer--bg" id="flower-bg">
                <img
                  id="flower-img-bg"
                  src="https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260808_192942_e1086505-d7da-433b-a59b-8220f4e6c808.png&w=1280&q=85"
                  alt="Pixel-art pink and violet lily"
                />
              </div>
              <div ref={layerTopRef} className="flower__layer flower__layer--top" id="flower-top" aria-hidden="true">
                <img
                  id="flower-img-top"
                  src="https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260808_151324_bf318a5f-5525-4fc7-aab5-e9a341018828.png&w=1280&q=85"
                  alt=""
                />
              </div>
            </div>
          </div>

          {/* Support Corner Copy */}
          <div className="support-copy support-copy--left">
            <span className="support-copy__inner">Every acre,<br />intelligently nurtured.</span>
          </div>

          <div className="support-copy support-copy--right">
            <span className="support-copy__inner">Less water wasted.<br />More bountiful yield.</span>
          </div>

          {/* Mobile Hamburger Button */}
          <button
            className={`mobile-burger ${isScrolled ? 'scrolled' : ''}`}
            id="mobile-burger-btn"
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <span></span>
          </button>

          {/* Mobile Scrim & Sheet */}
          <div
            className={`mobile-scrim ${menuOpen ? 'menu-open' : ''}`}
            onClick={() => setMenuOpen(false)}
          />
          <nav className={`mobile-sheet ${menuOpen ? 'menu-open' : ''}`} aria-label="Mobile Navigation">
            <Link href="#home" onClick={() => setMenuOpen(false)}>Home</Link>
            <Link href="#mission" onClick={() => setMenuOpen(false)}>Mission</Link>
            <Link href="#about" onClick={() => setMenuOpen(false)}>About Us</Link>
            <Link href="#tech" onClick={() => setMenuOpen(false)}>Tech</Link>
            <Link
              href="/dashboard"
              onClick={() => setMenuOpen(false)}
              style={{ marginTop: '1rem', color: '#e7b10a', fontWeight: 600 }}
            >
              Enter Dashboard →
            </Link>
          </nav>

        </section>

        {/* Mission Section (Camel to Light Peach background with MaskedHeading and CursorGrid) */}
        <MissionSection />

        {/* About Us Section (Circular 3D Perspective Builders Showcase) */}
        <AboutSection />

        {/* Tech Section (Dynamic WebGL Shader Feature Cards) */}
        <TechSection />

        {/* Final Section (Scroll Choreography & Hero Dashboard CTA) */}
        <FinalCtaSection />
      </main>

      <style jsx global>{`
        :root {
          --ink: #f7f1e5;
          --surface: #14160c;
          --gold: #e7b10a;
          --olive: #898121;
          --deep: #4c4b16;
          --orb-reveal: cubic-bezier(.16, 1, .3, 1);
          --orb-soft: cubic-bezier(.25, .8, .28, 1);
        }

        html.lenis, html.lenis body {
          height: auto;
        }
        .lenis.lenis-smooth {
          scroll-behavior: auto !important;
        }
        .lenis.lenis-smooth [data-lenis-prevent] {
          overscroll-behavior: contain;
        }
        .lenis.lenis-stopped {
          overflow: hidden;
        }
        .lenis.lenis-scrolling iframe {
          pointer-events: none;
        }

        html, body {
          width: 100%;
          min-height: 100%;
          margin: 0;
          overflow-x: clip;
          background: #14160c;
          color: #f7f1e5;
          font-family: "Orbit Sans", Arial, Helvetica, sans-serif;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          user-select: none;
        }

        main.viewport {
          position: relative;
          width: 100%;
          min-height: 100vh;
          background: #0d0f07;
          overflow-x: clip;
        }

        section.stage {
          position: relative;
          width: 100vw;
          height: 100vh;
          height: 100dvh;
          background: var(--surface);
          overflow: hidden;
          cursor: default;
        }

        .orbit-word { z-index: 1; }
        .flank-tag { z-index: 1; }
        .flower { z-index: 2; }
        .support-copy { z-index: 3; }
        .brand-mark, .primary-nav, .secure-pill { z-index: 100; }
        .mobile-scrim { z-index: 110; }
        .mobile-sheet { z-index: 111; }
        .mobile-burger { z-index: 112; }

        .brand-mark {
          position: fixed;
          top: clamp(16px, 2.14dvh, 32px);
          left: 3.854167vw;
          width: clamp(34px, min(3.4375vw, 5.2dvh), 66px);
          height: auto;
          display: block;
          pointer-events: auto;
          cursor: pointer;
          z-index: 100;
          transition: filter 0.3s ease, transform 0.3s ease;
        }

        .brand-mark.scrolled {
          filter: drop-shadow(0 4px 14px rgba(0, 0, 0, 0.25));
        }

        .brand-mark svg {
          width: 100%;
          height: 100%;
          display: block;
        }

        .brand-mark svg line {
          transition: stroke 0.3s ease;
        }

        .brand-mark.scrolled svg line {
          stroke: #14160c;
        }

        /* 2. PRIMARY NAV WITH WIDE UNIFORM GAP & FIXED GLASS SCROLL */
        .primary-nav {
          position: fixed;
          top: clamp(18px, 3.42dvh, 36px);
          left: 10.5vw;
          display: flex;
          align-items: center;
          gap: clamp(36px, 5.2vw, 84px);
          pointer-events: none;
          list-style: none;
          margin: 0;
          padding: 0;
          z-index: 100;
          transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .primary-nav.scrolled {
          background: rgba(20, 22, 12, 0.84);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(247, 241, 229, 0.16);
          border-radius: 9999px;
          padding: 8px clamp(18px, 2vw, 32px);
          box-shadow: 0 10px 32px rgba(0, 0, 0, 0.28);
          gap: clamp(24px, 3.6vw, 56px);
        }

        .primary-nav__item {
          position: static;
          font-size: clamp(13px, min(1.302083vw, 2.05dvh), 25px);
          line-height: 1;
          pointer-events: auto;
        }

        .primary-nav__item a {
          color: var(--ink);
          text-decoration: none;
          pointer-events: auto;
          transition: color 0.2s ease, opacity 0.2s ease;
          display: inline-block;
          white-space: nowrap;
        }

        .primary-nav__item a:hover {
          color: var(--gold);
          opacity: 0.95;
        }

        .secure-pill {
          position: fixed;
          top: clamp(16px, 2.33dvh, 32px);
          right: 7.5vw;
          height: clamp(34px, 4.439252dvh, 57px);
          padding: 0 clamp(16px, 1.8vw, 32px);
          background: var(--ink);
          color: var(--deep);
          border-radius: 999px;
          font-size: clamp(12px, min(1.15vw, 1.85dvh), 20px);
          font-weight: 600;
          letter-spacing: 0.026923em;
          display: flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
          pointer-events: auto;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
          transition: transform 0.2s ease, background-color 0.2s ease, box-shadow 0.2s ease, color 0.2s ease, border 0.2s ease;
          cursor: pointer;
          z-index: 100;
        }

        .secure-pill.scrolled {
          background: rgba(20, 22, 12, 0.9);
          color: #f7f1e5;
          border: 1px solid rgba(231, 177, 10, 0.35);
          box-shadow: 0 8px 28px rgba(0, 0, 0, 0.35);
        }

        .secure-pill:hover, .secure-pill.scrolled:hover {
          transform: translateY(-1px) scale(1.02);
          background: var(--gold);
          color: var(--surface);
          box-shadow: 0 6px 28px rgba(231, 177, 10, 0.35);
        }

        .secure-pill:active {
          transform: translateY(0) scale(0.98);
        }

        .orbit-word {
          position: absolute;
          top: 17.5dvh;
          left: 50%;
          transform: translateX(-50%);
          font-family: "Orbit Display", "Times New Roman", Times, serif;
          font-size: min(15.2vw, 30dvh);
          font-weight: 400;
          line-height: 0.82;
          letter-spacing: 0.05em;
          margin: 0;
          padding: 0;
          pointer-events: none;
          white-space: nowrap;
          text-align: center;
          z-index: 1;
        }

        .orbit-word__mask {
          display: block;
          overflow: hidden;
          padding-top: 0.14em;
          padding-bottom: 0.14em;
          margin-top: -0.14em;
          margin-bottom: -0.14em;
        }

        .orbit-word__inner {
          display: inline-flex;
          align-items: baseline;
          transform: scaleY(1.22);
          transform-origin: center center;
        }

        .orbit-word__white {
          position: relative;
          display: inline-block;
          color: var(--ink);
        }

        .orbit-word__white::before {
          content: '';
          position: absolute;
          top: -0.04em;
          left: 0;
          right: 0.04em;
          height: clamp(2px, 0.038em, 6px);
          background: var(--ink);
          border-radius: 1px;
        }

        .orbit-word__pink {
          position: relative;
          display: inline-block;
          background: linear-gradient(180deg, #f7f1e5 0%, #e7b10a 60%, #898121 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .orbit-word__pink::after {
          content: '';
          position: absolute;
          bottom: -0.04em;
          left: 0.04em;
          right: 0;
          height: clamp(2px, 0.038em, 6px);
          background: linear-gradient(90deg, #e7b10a, #898121);
          border-radius: 1px;
        }

        /* Flank Labels (AGRO / BUDDY BELOW CURVING PETALS) */
        .flank-tag {
          position: absolute;
          top: 70.5dvh;
          transform: translateY(-50%);
          font-family: "Orbit Sans", Arial, Helvetica, sans-serif;
          font-size: clamp(10px, 0.8vw, 13px);
          font-weight: 600;
          letter-spacing: 0.55em;
          text-transform: uppercase;
          color: var(--ink);
          opacity: 0.45;
          pointer-events: none;
          z-index: 1;
          white-space: nowrap;
          user-select: none;
        }

        .flank-tag--left {
          right: calc(50vw + 17.5vw);
          text-align: right;
        }

        .flank-tag--right {
          left: calc(50vw + 17.5vw);
          text-align: left;
        }

        .stage.anim .flank-tag {
          animation: orb-dim 650ms var(--orb-soft) 850ms both;
        }

        .flower {
          position: absolute;
          top: 14.749065dvh;
          left: 49.121328vw;
          height: 106.109034dvh;
          transform: translateX(-50%);
          transform-origin: center 40%;
          pointer-events: none;
          z-index: 2;
        }

        .flower__float {
          position: relative;
          width: 100%;
          height: 100%;
          transform-origin: center 40%;
          will-change: transform;
          pointer-events: none;
        }

        .flower__sizer {
          visibility: hidden;
          height: 100%;
          width: auto;
          display: block;
          max-width: none;
        }

        .flower__layer {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
        }

        .flower__layer img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          pointer-events: none;
        }

        .flower__layer--top {
          -webkit-mask-image: linear-gradient(#0000, #0000);
          mask-image: linear-gradient(#0000, #0000);
          -webkit-mask-size: 100% 100%;
          mask-size: 100% 100%;
          -webkit-mask-repeat: no-repeat;
          mask-repeat: no-repeat;
        }

        .flower__layer--bg {
          -webkit-mask-size: 100% 100%;
          mask-size: 100% 100%;
          -webkit-mask-repeat: no-repeat;
          mask-repeat: no-repeat;
        }

        .support-copy {
          position: absolute;
          bottom: 4.361371dvh;
          color: var(--ink);
          font-size: clamp(14px, min(1.40625vw, 2.102804dvh), 27px);
          line-height: 1.28;
          pointer-events: none;
          white-space: nowrap;
        }

        .support-copy__inner {
          display: block;
        }

        .support-copy--left {
          left: 3.177083vw;
          transform: scaleX(1.073);
          transform-origin: left bottom;
        }

        .support-copy--right {
          left: 78.28125vw;
          transform: scaleX(1.058);
          transform-origin: left bottom;
        }

        .mobile-burger {
          display: none;
          position: fixed;
          top: clamp(16px, 2.3dvh, 32px);
          right: 5vw;
          width: 44px;
          height: 44px;
          background: var(--ink);
          border-radius: 50%;
          border: none;
          cursor: pointer;
          align-items: center;
          justify-content: center;
          pointer-events: auto;
          z-index: 112;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.35);
          transition: background 0.3s, transform 0.3s;
        }

        .mobile-burger.scrolled {
          background: #14160c;
          border: 1px solid rgba(231, 177, 10, 0.3);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
        }

        .mobile-burger span,
        .mobile-burger span::before,
        .mobile-burger span::after {
          content: '';
          display: block;
          width: 18px;
          height: 2px;
          background: var(--deep);
          border-radius: 2px;
          transition: transform 0.3s ease, opacity 0.3s ease, background 0.3s ease;
          position: relative;
        }

        .mobile-burger.scrolled span,
        .mobile-burger.scrolled span::before,
        .mobile-burger.scrolled span::after {
          background: #f7f1e5;
        }

        .mobile-burger span::before {
          position: absolute;
          top: -6px;
          left: 0;
        }

        .mobile-burger span::after {
          position: absolute;
          top: 6px;
          left: 0;
        }

        .mobile-scrim {
          display: none;
          position: fixed;
          inset: 0;
          background: rgba(13, 15, 7, 0.75);
          backdrop-filter: blur(6px);
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.3s ease;
        }

        .mobile-sheet {
          display: none;
          position: fixed;
          top: 0;
          right: 0;
          bottom: 0;
          width: min(80vw, 320px);
          background: rgba(20, 22, 12, 0.96);
          backdrop-filter: blur(16px);
          border-left: 1px solid rgba(137, 129, 33, 0.3);
          padding: 5rem 2rem 2rem;
          transform: translateX(100%);
          transition: transform 0.35s var(--orb-reveal);
          flex-direction: column;
          gap: 1.5rem;
        }

        .mobile-sheet a {
          color: var(--ink);
          text-decoration: none;
          font-size: 1.25rem;
          font-weight: 500;
          opacity: 0.9;
          transition: color 0.2s, opacity 0.2s;
        }

        .mobile-sheet a:hover {
          color: var(--gold);
          opacity: 1;
        }

        .mobile-scrim.menu-open {
          opacity: 1;
          pointer-events: auto;
        }

        .mobile-sheet.menu-open {
          transform: translateX(0);
          pointer-events: auto;
        }

        @keyframes orb-word {
          from { transform: translateY(118%); }
          to { transform: translateY(0); }
        }

        @keyframes orb-subject {
          from { opacity: 0; transform: translateX(-50%) translateY(3.4dvh); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }

        @keyframes orb-corner {
          from { opacity: 0; transform: translateY(1.5dvh); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes orb-quiet {
          from { opacity: 0; transform: translateY(1.2dvh); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes orb-dim {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .stage.anim .brand-mark {
          animation: orb-quiet 620ms var(--orb-soft) 100ms both;
        }

        .stage.anim .primary-nav__item--home {
          animation: orb-dim 550ms var(--orb-soft) 180ms both;
        }

        .stage.anim .primary-nav__item--mission {
          animation: orb-dim 550ms var(--orb-soft) 225ms both;
        }

        .stage.anim .primary-nav__item--about {
          animation: orb-dim 550ms var(--orb-soft) 270ms both;
        }

        .stage.anim .primary-nav__item--tech {
          animation: orb-dim 550ms var(--orb-soft) 315ms both;
        }

        .stage.anim .secure-pill {
          animation: orb-quiet 620ms var(--orb-soft) 340ms both;
        }

        .stage.anim .orbit-word__inner {
          animation: orb-word 1150ms var(--orb-reveal) 300ms both;
        }

        .stage.anim .flower {
          animation: orb-subject 1150ms var(--orb-reveal) 660ms both;
        }

        .stage.anim .support-copy__inner {
          animation: orb-corner 720ms var(--orb-soft) 980ms both;
        }

        .stage.anim .mobile-burger {
          animation: orb-quiet 620ms var(--orb-soft) 300ms both;
        }

        @media (max-width: 1200px) {
          .orbit-word {
            left: 0;
            width: 100%;
            text-align: center;
          }
          .support-copy--right {
            left: auto;
            right: 4vw;
          }
        }

        @media (max-width: 900px), (max-aspect-ratio: 4/5) {
          .primary-nav, .secure-pill {
            display: none !important;
          }
          .mobile-burger, .mobile-scrim, .mobile-sheet {
            display: flex;
          }
          .flower {
            top: 22dvh;
            height: min(55dvh, 110vw);
          }
          .orbit-word {
            top: 14dvh;
            font-size: min(27.5vw, 18dvh);
          }
          .support-copy {
            white-space: normal;
            max-width: 42vw;
            font-size: 13px;
          }
          .support-copy--left {
            left: 5vw;
          }
          .support-copy--right {
            right: 5vw;
            text-align: right;
          }
        }
      `}</style>
    </>
  );
}
