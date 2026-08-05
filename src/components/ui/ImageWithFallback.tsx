"use client";

import Image, { ImageProps } from "next/image";
import { useState } from "react";

interface ImageWithFallbackProps extends Omit<ImageProps, "src"> {
  src: string | null | undefined;
  fallback: React.ReactNode;
}

export default function ImageWithFallback({
  src,
  fallback,
  alt,
  ...props
}: ImageWithFallbackProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError || !src) {
    return fallback;
  }

  return (
    <Image {...props} src={src} alt={alt} onError={() => setHasError(true)} />
  );
}
