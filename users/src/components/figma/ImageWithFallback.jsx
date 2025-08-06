import React, { useState } from 'react';

export function ImageWithFallback({ src, alt, className, width, height, fallback, ...props }) {
  const [imageSrc, setImageSrc] = useState(src);
  const [imageError, setImageError] = useState(false);

  const handleError = () => {
    if (!imageError) {
      setImageError(true);
      if (fallback) {
        setImageSrc(fallback);
      } else {
        // Use a default placeholder image
        setImageSrc(`https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=${width || 400}&h=${height || 300}&fit=crop&q=80`);
      }
    }
  };

  return (
    <img
      src={imageSrc}
      alt={alt}
      className={className}
      width={width}
      height={height}
      onError={handleError}
      {...props}
    />
  );
}