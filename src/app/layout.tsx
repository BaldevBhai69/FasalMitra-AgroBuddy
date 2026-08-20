import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'FasalMitra (AgroSmart) — Precision Agronomy & Virtual IoT Twin',
  description: 'AI-Powered Smart Agriculture, Real-time FAO-56 Irrigation Advisory, APMC Mandi Market Intelligence & Dual-Engine Crop Advisor',
};

import { AuthProvider } from '@/lib/auth-context';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-[#14160C] text-[#f7f1e5]">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
