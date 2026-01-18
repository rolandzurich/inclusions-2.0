'use client';

import Image from 'next/image';

interface PartnerLogoProps {
  src: string;
  alt: string;
}

export function PartnerLogo({ src, alt }: PartnerLogoProps) {
  // Spezielle Behandlung für dunkle Logos, die besser sichtbar gemacht werden müssen
  const isDarkLogo = src.includes('watchman');
  
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <Image
        src={src}
        alt={alt}
        width={120}
        height={120}
        className={`max-h-20 max-w-full h-auto w-auto object-contain transition-all duration-200 ease-in-out ${
          isDarkLogo 
            ? 'brightness-[1.8] contrast-150 drop-shadow-lg' 
            : ''
        }`}
        loading="lazy"
        style={{ objectFit: 'contain' }}
      />
    </div>
  );
}
