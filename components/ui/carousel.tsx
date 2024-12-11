'use client';

import React from 'react';
import { Dialog, VisuallyHidden } from '@radix-ui/themes';
import Image from 'next/image';
import {
  Cross1Icon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@radix-ui/react-icons';

interface CarouselProps {
  images: string[];
  initialIndex: number;
  onClose: () => void;
  altPrefix: string;
}

export default function Carousel({
  images,
  initialIndex,
  onClose,
  altPrefix,
}: CarouselProps) {
  const [currentIndex, setCurrentIndex] = React.useState(initialIndex);
  const currentImage = React.useMemo(
    () => images[currentIndex] || '',
    [images, currentIndex],
  );

  const handleKeyDown = React.useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
      } else if (e.key === 'ArrowRight') {
        setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'Escape') {
        onClose();
      }
    },
    [images.length, onClose],
  );

  React.useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <Dialog.Root open onOpenChange={onClose}>
      <Dialog.Content
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
        style={{ maxWidth: '100vw', maxHeight: '100vh', margin: 0 }}
      >
        <Dialog.Title>
          <VisuallyHidden>
            Image {currentIndex + 1} of {images.length}
          </VisuallyHidden>
        </Dialog.Title>

        <Dialog.Description>
          <VisuallyHidden>
            Use arrow keys to navigate between images. Press Escape to close.
          </VisuallyHidden>
        </Dialog.Description>

        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-50 rounded-full bg-black/50 p-2 text-white"
          aria-label="Close image viewer"
        >
          <Cross1Icon width={24} height={24} />
        </button>

        <div className="relative h-full w-full">
          <div className="absolute inset-0 flex items-center justify-center">
            <Image
              src={currentImage}
              alt={`${altPrefix} ${currentIndex + 1}`}
              fill
              className="object-contain"
              priority
              sizes="100vw"
              quality={100}
              onError={() => {
                onClose();
              }}
            />
          </div>

          {images.length > 1 && (
            <>
              <button
                onClick={() =>
                  setCurrentIndex((prev) =>
                    prev > 0 ? prev - 1 : images.length - 1,
                  )
                }
                className="absolute left-4 top-1/2 z-50 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white"
                aria-label="Previous image"
              >
                <ChevronLeftIcon width={24} height={24} />
              </button>
              <button
                onClick={() =>
                  setCurrentIndex((prev) =>
                    prev < images.length - 1 ? prev + 1 : 0,
                  )
                }
                className="absolute right-4 top-1/2 z-50 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white"
                aria-label="Next image"
              >
                <ChevronRightIcon width={24} height={24} />
              </button>
            </>
          )}
        </div>
      </Dialog.Content>
    </Dialog.Root>
  );
}
