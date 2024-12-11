'use client';

import React, { memo } from 'react';
import Image from 'next/image';
import { Pencil1Icon } from '@radix-ui/react-icons';
import { cn } from '@/lib/utils';
import { Skeleton } from '@radix-ui/themes';

interface UserAvatarProps {
  displayedImage: string;
  username: string;
  edit: boolean;
  isImageUploading: boolean;
  onAvatarClick: () => void;
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap = {
  sm: 'h-16 w-16',
  md: 'h-24 w-24',
  lg: 'h-32 w-32',
};

const sizesMap = {
  sm: '64px',
  md: '96px',
  lg: '128px',
};

const blurDataURL =
  'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDABQODxIPDRQSEBIXFRQdHx4eHRoaHSQtJSEkLzYvLy02ODM4NjhDRz89Q0dDTkNHVE1MTE1dWVtZSlxKR1BLTVb/2wBDAR';

const UserAvatar = memo(function UserAvatar({
  displayedImage,
  username,
  edit,
  isImageUploading,
  onAvatarClick,
  size = 'md',
}: UserAvatarProps) {
  const [isLoading, setIsLoading] = React.useState(true);
  const imageRef = React.useRef<HTMLImageElement>(null);

  // Check if image is already cached
  React.useEffect(() => {
    if (imageRef.current?.complete) {
      setIsLoading(false);
    }
  }, []);

  return (
    <div
      className={cn(
        'relative cursor-pointer overflow-hidden rounded-full bg-gray-4',
        sizeMap[size],
      )}
      onClick={onAvatarClick}
    >
      <div className="relative h-full w-full">
        {isLoading && (
          <Skeleton
            className={cn('absolute inset-0 z-10 rounded-full', sizeMap[size])}
          />
        )}
        <Image
          ref={imageRef}
          src={displayedImage}
          alt={`${username}'s profile`}
          fill
          sizes={sizesMap[size]}
          className={cn(
            'rounded-full object-cover',
            isLoading ? 'scale-110 blur-sm' : 'scale-100 blur-0',
            'transition-all duration-200',
          )}
          priority
          quality={75} // Reduced quality for faster loading
          loading="eager"
          placeholder="blur"
          blurDataURL={blurDataURL}
          onLoad={(event) => {
            if (
              event.target instanceof HTMLImageElement &&
              event.target.complete
            ) {
              setIsLoading(false);
            }
          }}
          onError={() => setIsLoading(false)}
        />
        {!isLoading && edit && (
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 transition-opacity hover:opacity-100">
            <Pencil1Icon className="text-white" width={24} height={24} />
          </div>
        )}
        {!isLoading && isImageUploading && (
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50">
            <span className="text-white">Uploading...</span>
          </div>
        )}
      </div>
    </div>
  );
});

export default UserAvatar;
