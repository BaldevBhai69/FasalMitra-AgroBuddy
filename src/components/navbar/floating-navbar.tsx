'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface FloatingNavbarProps {
  onAddCropClick?: () => void;
}

export function FloatingNavbar({ onAddCropClick }: FloatingNavbarProps) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Overview', href: '/dashboard' },
    { label: 'Crops', href: '/dashboard/crops' },
    { label: 'AI Advisor', href: '/dashboard/ai-advisor' },
    { label: 'Leaf Scanner', href: '/dashboard/diagnose' },
    { label: 'Mandi Market', href: '/dashboard/mandi' },
    { label: 'Weather', href: '/dashboard/weather' },
  ];

  return (
    <>
      <header className="fixed top-4 inset-x-0 z-50 flex justify-center px-4 pointer-events-none transition-all duration-300">
        <nav
          className={`pointer-events-auto flex items-center justify-between gap-2 md:gap-6 px-4 md:px-6 py-2.5 rounded-full border transition-all duration-300 ${
            scrolled
              ? 'bg-[#14160c]/90 backdrop-blur-xl border-[#898121]/40 shadow-2xl shadow-black/60 translate-y-0 scale-[0.98]'
              : 'bg-[#1e2010]/85 backdrop-blur-lg border-[#898121]/25 shadow-xl shadow-black/40'
          }`}
          style={{ maxWidth: '1080px', width: '100%' }}
          aria-label="Dashboard Navigation"
        >
          {/* Left: Brand Logo & Title */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-full bg-[#e7b10a] flex items-center justify-center text-[#14160c] font-black text-sm shadow-md group-hover:scale-105 transition-transform">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.333M4.5 21V10.333" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold tracking-tight text-[#f7f1e5] group-hover:text-[#e7b10a] transition-colors leading-tight">
                FasalMitra
              </span>
              <span className="text-[10px] text-[#898121] uppercase tracking-wider font-medium">
                AgroSmart
              </span>
            </div>
          </Link>

          {/* Center Links (Desktop) */}
          <div className="hidden lg:flex items-center gap-1 bg-[#14160c]/50 p-1 rounded-full border border-[#898121]/20">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-[#e7b10a] text-[#14160c] font-semibold shadow-sm'
                      : 'text-[#f7f1e5]/80 hover:text-[#f7f1e5] hover:bg-[#898121]/20'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            {onAddCropClick ? (
              <button
                onClick={onAddCropClick}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#e7b10a] hover:bg-[#f7f1e5] text-[#14160c] text-xs font-semibold shadow-md transition-all duration-200 active:scale-95"
              >
                <span>+</span>
                <span className="hidden sm:inline">Add Crop</span>
              </button>
            ) : (
              <Link
                href="/dashboard/crops"
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#e7b10a] hover:bg-[#f7f1e5] text-[#14160c] text-xs font-semibold shadow-md transition-all duration-200 active:scale-95"
              >
                <span>+</span>
                <span className="hidden sm:inline">Add Crop</span>
              </Link>
            )}

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden w-8 h-8 rounded-full bg-[#14160c]/60 border border-[#898121]/30 flex items-center justify-center text-[#f7f1e5] hover:text-[#e7b10a] transition-colors"
              aria-label="Toggle navigation menu"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden flex flex-col justify-start pt-20 px-6 bg-[#14160c]/95 backdrop-blur-2xl border-b border-[#898121]/30 animate-in fade-in duration-200">
          <div className="flex flex-col gap-2 py-4">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-[#e7b10a] text-[#14160c] font-bold'
                      : 'text-[#f7f1e5] hover:bg-[#1e2010]'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}
