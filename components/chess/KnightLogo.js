'use client';
import Image from 'next/image';

export default function KnightLogo({ size = 40, className = '' }) {
  return (
    <div
      className={`relative shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      <Image
        src="/xlchess-logo.png"
        alt="XLCHESS Logo"
        width={size}
        height={size}
        priority
        className="w-full h-full object-contain rounded-2xl"
        style={{
          filter: 'drop-shadow(0 10px 25px rgba(139,92,246,0.55))',
        }}
      />
    </div>
  );
}
