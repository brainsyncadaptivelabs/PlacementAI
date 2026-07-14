import React from "react";
import Image from "next/image";

interface PlacementAILogoProps {
  size?: number;
  className?: string;
}

export default function PlacementAILogo({ size = 40, className = "" }: PlacementAILogoProps) {
  return (
    <div
      className={`relative select-none flex-shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      <Image
        src="/placementai-brand-symbol-v2.png"
        alt="PlacementAI"
        fill
        sizes={`${size}px`}
        priority
        className="object-contain"
      />
    </div>
  );
}
