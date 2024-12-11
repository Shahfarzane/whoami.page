import React, { useState } from 'react';
import { Project, UserExperience } from '@/types/user';
import Carousel from '@/components/ui/carousel';
import Image from 'next/image';
import { AspectRatio, Card } from '@radix-ui/themes';

interface ImageCardProps {
  image: string;
  item: Project | UserExperience;
  index: number;
}

const ImageCard: React.FC<ImageCardProps> = ({ image, item, index }) => {
  const [isCarouselOpen, setIsCarouselOpen] = useState(false);

  return (
    <div className="h-auto w-[100px]">
      <AspectRatio ratio={16 / 9}>
        <Card
          m="0"
          key={index}
          className="h-full w-full cursor-pointer overflow-hidden border p-0 transition-transform hover:scale-105"
          onClick={() => setIsCarouselOpen(true)}
          role="button"
          tabIndex={0}
          aria-label={`Open image carousel for ${item.title}`}
        >
          <Image
            src={image}
            alt={`${item.title} image ${index + 1}`}
            className="rounded-lg object-cover"
            style={{
              width: '100%',
              height: 'auto',
            }}
            width={500}
            height={300}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            loading="lazy"
            placeholder="blur"
            blurDataURL={`data:image/svg+xml;base64,${toBase64(shimmer(700, 475))}`}
          />
        </Card>
      </AspectRatio>
      {isCarouselOpen && (
        <Carousel
          images={item.images || []}
          initialIndex={index}
          onClose={() => setIsCarouselOpen(false)}
          altPrefix={item.title}
        />
      )}

      {isCarouselOpen && (
        <Carousel
          images={item.images || []}
          initialIndex={index}
          onClose={() => setIsCarouselOpen(false)}
          altPrefix={item.title}
        />
      )}
    </div>
  );
};

const shimmer = (w: number, h: number) => `
<svg width="${w}" height="${h}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <linearGradient id="g">
      <stop stop-color="#333" offset="20%" />
      <stop stop-color="#222" offset="50%" />
      <stop stop-color="#333" offset="70%" />
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="#333" />
  <rect id="r" width="${w}" height="${h}" fill="url(#g)" />
  <animate xlink:href="#r" attributeName="x" from="-${w}" to="${w}" dur="1s" repeatCount="indefinite"  />
</svg>`;

const toBase64 = (str: string) =>
  typeof window === 'undefined'
    ? Buffer.from(str).toString('base64')
    : window.btoa(str);

export default ImageCard;
