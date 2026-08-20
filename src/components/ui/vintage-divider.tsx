'use client';

import React from 'react';

interface VintageDividerProps {
  className?: string;
  color?: string;
}

export const VintageDivider: React.FC<VintageDividerProps> = ({
  className = '',
  color = '#E7B10A',
}) => {
  return (
    <div className={`w-full flex items-center justify-center overflow-hidden py-4 ${className}`}>
      <svg
        viewBox="0 0 1000 60"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full max-w-4xl h-auto"
        style={{ filter: 'drop-shadow(0 0 8px rgba(231, 177, 10, 0.35))' }}
      >
        {/* Center Star / Diamond Accent */}
        <polygon points="500,20 506,30 500,40 494,30" fill={color} />
        <circle cx="500" cy="14" r="2" fill={color} />
        <circle cx="500" cy="46" r="2" fill={color} />

        {/* --- LEFT SIDE FLOURISH & RULE --- */}
        {/* Left Diamond Tip */}
        <polygon points="12,30 28,24 44,30 28,36" fill={color} />

        {/* Left Horizontal Rule */}
        <line
          x1="28"
          y1="30"
          x2="275"
          y2="30"
          stroke={color}
          strokeWidth="2.2"
          strokeLinecap="round"
        />

        {/* Left Flourish Loop 1 (Outer upper ribbon arch) */}
        <path
          d="M 315 30 C 330 16, 375 10, 425 14 C 470 18, 490 28, 500 30"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />

        {/* Left Flourish Loop 2 (S-Swirl ribbon looping back) */}
        <path
          d="M 425 14 C 385 24, 335 32, 310 24 C 295 19, 310 12, 345 13 C 400 15, 455 24, 496 30"
          stroke={color}
          strokeWidth="1.8"
          strokeLinecap="round"
          fill="none"
        />

        {/* Left Flourish Loop 3 (Lower swooping curve) */}
        <path
          d="M 320 30 C 355 42, 420 44, 470 36 C 485 33, 495 31, 500 30"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />

        {/* Left End Scroll / Spiral Tip */}
        <path
          d="M 285 36 C 275 40, 264 36, 268 28 C 273 20, 288 22, 296 30 C 315 46, 365 48, 410 42 C 455 36, 482 30, 498 30"
          stroke={color}
          strokeWidth="1.8"
          strokeLinecap="round"
          fill="none"
        />

        {/* --- RIGHT SIDE FLOURISH & RULE (SYMMETRICAL) --- */}
        {/* Right Diamond Tip */}
        <polygon points="988,30 972,24 956,30 972,36" fill={color} />

        {/* Right Horizontal Rule */}
        <line
          x1="972"
          y1="30"
          x2="725"
          y2="30"
          stroke={color}
          strokeWidth="2.2"
          strokeLinecap="round"
        />

        {/* Right Flourish Loop 1 (Outer upper ribbon arch) */}
        <path
          d="M 685 30 C 670 16, 625 10, 575 14 C 530 18, 510 28, 500 30"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />

        {/* Right Flourish Loop 2 (S-Swirl ribbon looping back) */}
        <path
          d="M 575 14 C 615 24, 665 32, 690 24 C 705 19, 690 12, 655 13 C 600 15, 545 24, 504 30"
          stroke={color}
          strokeWidth="1.8"
          strokeLinecap="round"
          fill="none"
        />

        {/* Right Flourish Loop 3 (Lower swooping curve) */}
        <path
          d="M 680 30 C 645 42, 580 44, 530 36 C 515 33, 505 31, 500 30"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />

        {/* Right End Scroll / Spiral Tip */}
        <path
          d="M 715 36 C 725 40, 736 36, 732 28 C 727 20, 712 22, 704 30 C 685 46, 635 48, 590 42 C 545 36, 518 30, 502 30"
          stroke={color}
          strokeWidth="1.8"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
    </div>
  );
};

export default VintageDivider;
