"use client";

import Image from "next/image";

interface RueckblickImageProps {
  src: string;
  alt: string;
  title?: string;
  description?: string;
  onClick?: () => void;
}

export function RueckblickImage({ src, alt, title, description, onClick }: RueckblickImageProps) {
  return (
    <div
      className="relative h-64 rounded-2xl overflow-hidden group cursor-pointer bg-white/5"
      onClick={onClick}
    >
      <div className="absolute inset-0 animate-float">
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover scale-110 group-hover:scale-100 transition-transform duration-[20s] ease-out"
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          unoptimized
        />
      </div>
      
      {/* Overlay with title always visible */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/0 to-black/0 opacity-100">
        <div className="absolute bottom-0 left-0 right-0 p-4">
          {title && (
            <h3 className="text-white font-semibold text-lg mb-1">{title}</h3>
          )}
          {description && (
            <p className="text-white/80 text-sm line-clamp-2">{description}</p>
          )}
        </div>
      </div>
    </div>
  );
}


