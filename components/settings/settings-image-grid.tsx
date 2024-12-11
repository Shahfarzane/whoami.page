import React, { useState, useCallback } from 'react';
import Image from 'next/image';
import { Text } from '@radix-ui/themes';
import { Cross1Icon } from '@radix-ui/react-icons';
import { getBlurDataURL } from '@/lib/utils';

interface SettingsImageGridProps {
  images: { url: string; aspectRatio: number }[];
  onRemoveImage: (imageUrl: string) => void;
  onImageLoad: (
    index: number,
    event: React.SyntheticEvent<HTMLImageElement>,
  ) => void;
}

const SettingsImageGrid: React.FC<SettingsImageGridProps> = ({
  images,
  onRemoveImage,
  onImageLoad,
}) => {
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());

  const handleImageLoaded = useCallback(
    (
      imageUrl: string,
      index: number,
      event: React.SyntheticEvent<HTMLImageElement>,
    ) => {
      setLoadedImages((prev) => new Set(prev).add(imageUrl));
      onImageLoad(index, event);
    },
    [onImageLoad],
  );

  return (
    <>
      <Text as="p" size="2" weight="medium" mb="2">
        Uploaded Images:
      </Text>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {images.map((image, index) => (
          <div
            key={image.url}
            className="group relative w-full overflow-hidden rounded-md bg-gray-100 dark:bg-gray-800"
            style={{ paddingBottom: `${100 / image.aspectRatio}%` }}
          >
            <div className="absolute inset-0">
              <Image
                src={image.url}
                alt={`Uploaded image ${index + 1}`}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                className={`object-cover transition-opacity duration-300 ${
                  loadedImages.has(image.url) ? 'opacity-100' : 'opacity-0'
                }`}
                onLoad={(event) => handleImageLoaded(image.url, index, event)}
                placeholder="blur"
                blurDataURL={getBlurDataURL()}
              />
              <button
                onClick={() => onRemoveImage(image.url)}
                className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black bg-opacity-50 text-white opacity-0 transition-opacity duration-200 hover:bg-opacity-70 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 group-hover:opacity-100"
                aria-label={`Remove image ${index + 1}`}
              >
                <Cross1Icon className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default SettingsImageGrid;
