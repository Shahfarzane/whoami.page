'use client';

import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import Carousel from '@/components/ui/carousel';

interface PostImageGridProps {
  images: string[];
  authorUsername: string;
  onImageClick?: (index: number) => void;
  isFirst?: boolean;
}

export default function PostImageGrid({
  images,
  authorUsername,
  onImageClick,
  isFirst = false,
}: PostImageGridProps) {
  const [mounted, setMounted] = React.useState(false);
  const [showCarousel, setShowCarousel] = React.useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = React.useState(0);

  const getGridLayout = (count: number) => {
    switch (count) {
      case 1:
        return 'grid-cols-1';
      case 2:
        return 'grid-cols-2';
      case 3:
        return 'grid-cols-2';
      default:
        return 'grid-cols-2';
    }
  };

  const getImageContainerClass = (count: number, index: number) => {
    const baseClasses =
      'relative aspect-[16/9] w-full cursor-pointer overflow-hidden rounded-[12px] border border-border will-change-transform';
    if (count === 1) return cn(baseClasses, 'aspect-[16/9] max-h-[500px]');
    if (count === 3 && index === 0)
      return cn(baseClasses, 'aspect-square row-span-2');
    return cn(baseClasses, 'aspect-square');
  };

  const handleImageClick = (index: number) => {
    setSelectedImageIndex(index);
    setShowCarousel(true);
    onImageClick?.(index);
  };

  if (!images?.length) return null;

  return (
    <div suppressHydrationWarning>
      <div
        className={cn('mt-2 grid gap-2', getGridLayout(images.length))}
        style={{
          maxHeight: images.length === 1 ? '500px' : '600px',
        }}
      >
        {images.map((image, index) => (
          <div
            key={index}
            className={getImageContainerClass(images.length, index)}
          >
            <Image
              src={image}
              alt={`Post image ${index + 1} by ${authorUsername}`}
              fill
              sizes={
                images.length === 1
                  ? '(max-width: 768px) 100vw, 600px'
                  : '(max-width: 768px) 50vw, 300px'
              }
              className="object-cover transition-transform duration-200 hover:scale-105"
              priority={isFirst && index === 0}
              onClick={() => handleImageClick(index)}
              loading={isFirst && index === 0 ? 'eager' : 'lazy'}
            />
          </div>
        ))}
      </div>

      {mounted && showCarousel && (
        <Carousel
          images={images}
          initialIndex={selectedImageIndex}
          onClose={() => setShowCarousel(false)}
          altPrefix={`Post image by ${authorUsername}`}
        />
      )}
    </div>
  );
}
