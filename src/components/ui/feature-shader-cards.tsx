'use client';

import React from 'react';
import { Warp } from '@paper-design/shaders-react';

export interface Feature {
  title: string;
  description: string;
  icon: React.ReactNode;
}

const features: Feature[] = [
  {
    title: 'IoT Soil Telemetry',
    description:
      'Real-time NPK, soil moisture, and pH telemetry streamed continuously from low-power sub-GHz field probes.',
    icon: (
      <svg className="w-10 h-10 text-[#f7f1e5]" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
      </svg>
    ),
  },
  {
    title: 'FAO-56 Irrigation Engine',
    description:
      'Automated Penman-Monteith evapotranspiration algorithms calculating precision water requirements per crop stage.',
    icon: (
      <svg className="w-10 h-10 text-[#f7f1e5]" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0z" />
      </svg>
    ),
  },
  {
    title: 'AI Vision Pathology',
    description:
      'Edge-computed Computer Vision diagnosing foliar diseases, blights, and pest infestations in milliseconds.',
    icon: (
      <svg className="w-10 h-10 text-[#f7f1e5]" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 7V5a2 2 0 012-2h2m10 0h2a2 2 0 012 2v2m0 10v2a2 2 0 01-2 2h-2m-10 0H5a2 2 0 01-2-2v-2" />
        <circle cx="12" cy="12" r="3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: 'Satellite NDVI Telemetry',
    description:
      'Multispectral Sentinel-2 satellite telemetry tracking chlorophyll density, canopy moisture, and biomass health.',
    icon: (
      <svg className="w-10 h-10 text-[#f7f1e5]" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    title: 'APMC Mandi Intelligence',
    description:
      'Predictive neural networks forecasting commodity spot prices, arrival volumes, and peak selling windows across India.',
    icon: (
      <svg className="w-10 h-10 text-[#f7f1e5]" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
      </svg>
    ),
  },
  {
    title: 'Hyper-Local Microclimate',
    description:
      'Sub-kilometer numerical weather prediction synthesizing global ECMWF forecasts with live on-farm micro-sensors.',
    icon: (
      <svg className="w-10 h-10 text-[#f7f1e5]" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 00-9.78 2.096A4.001 4.001 0 003 15z" />
      </svg>
    ),
  },
];

export default function FeaturesCards() {
  const getShaderConfig = (index: number) => {
    const configs = [
      {
        proportion: 0.3,
        softness: 0.8,
        distortion: 0.15,
        swirl: 0.6,
        swirlIterations: 8,
        shape: 'checks' as const,
        shapeScale: 0.08,
        colors: ['hsl(280, 100%, 30%)', 'hsl(320, 100%, 60%)', 'hsl(340, 90%, 40%)', 'hsl(300, 100%, 70%)'],
      },
      {
        proportion: 0.4,
        softness: 1.2,
        distortion: 0.2,
        swirl: 0.9,
        swirlIterations: 12,
        shape: 'stripes' as const,
        shapeScale: 0.12,
        colors: ['hsl(200, 100%, 25%)', 'hsl(180, 100%, 65%)', 'hsl(160, 90%, 35%)', 'hsl(190, 100%, 75%)'],
      },
      {
        proportion: 0.35,
        softness: 0.9,
        distortion: 0.18,
        swirl: 0.7,
        swirlIterations: 10,
        shape: 'checks' as const,
        shapeScale: 0.1,
        colors: ['hsl(120, 100%, 25%)', 'hsl(140, 100%, 60%)', 'hsl(100, 90%, 30%)', 'hsl(130, 100%, 70%)'],
      },
      {
        proportion: 0.45,
        softness: 1.1,
        distortion: 0.22,
        swirl: 0.8,
        swirlIterations: 15,
        shape: 'stripes' as const,
        shapeScale: 0.09,
        colors: ['hsl(30, 100%, 35%)', 'hsl(50, 100%, 65%)', 'hsl(40, 90%, 40%)', 'hsl(45, 100%, 75%)'],
      },
      {
        proportion: 0.38,
        softness: 0.95,
        distortion: 0.16,
        swirl: 0.85,
        swirlIterations: 11,
        shape: 'checks' as const,
        shapeScale: 0.11,
        colors: ['hsl(250, 100%, 30%)', 'hsl(270, 100%, 65%)', 'hsl(260, 90%, 35%)', 'hsl(265, 100%, 70%)'],
      },
      {
        proportion: 0.42,
        softness: 1.0,
        distortion: 0.19,
        swirl: 0.75,
        swirlIterations: 9,
        shape: 'stripes' as const,
        shapeScale: 0.13,
        colors: ['hsl(330, 100%, 30%)', 'hsl(350, 100%, 60%)', 'hsl(340, 90%, 35%)', 'hsl(345, 100%, 75%)'],
      },
    ];
    return configs[index % configs.length];
  };

  return (
    <div className="w-full max-w-[1140px] mx-auto px-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {features.map((feature, index) => {
          const shaderConfig = getShaderConfig(index);
          return (
            <div
              key={index}
              className="relative min-h-[340px] rounded-3xl transition-transform duration-300 hover:-translate-y-1 group"
            >
              {/* Dynamic WebGL Shader Background */}
              <div className="absolute inset-0 rounded-3xl overflow-hidden shadow-xl">
                <Warp
                  style={{ height: '100%', width: '100%' }}
                  proportion={shaderConfig.proportion}
                  softness={shaderConfig.softness}
                  distortion={shaderConfig.distortion}
                  swirl={shaderConfig.swirl}
                  swirlIterations={shaderConfig.swirlIterations}
                  shape={shaderConfig.shape}
                  shapeScale={shaderConfig.shapeScale}
                  scale={1}
                  rotation={0}
                  speed={0.8}
                  colors={shaderConfig.colors}
                />
              </div>

              {/* Glass Foreground Card Content */}
              <div className="relative z-10 p-7 md:p-8 rounded-3xl h-full flex flex-col justify-center bg-black/75 backdrop-blur-md border border-white/20 transition-colors duration-300 group-hover:border-white/40 shadow-2xl">
                <div>
                  <div className="mb-5 filter drop-shadow-md text-[#f7f1e5]">
                    {feature.icon}
                  </div>

                  <h3
                    className="text-xl md:text-2xl font-bold mb-3 text-white tracking-wide"
                    style={{ fontFamily: '"Orbit Display", "Times New Roman", Times, serif' }}
                  >
                    {feature.title}
                  </h3>

                  <p
                    className="leading-relaxed text-gray-200 text-sm md:text-[15px] font-medium"
                    style={{ fontFamily: '"Orbit Sans", -apple-system, sans-serif' }}
                  >
                    {feature.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
