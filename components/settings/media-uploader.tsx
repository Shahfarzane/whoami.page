import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Box, Flex, Spinner, Text } from '@radix-ui/themes';
import { useUploadThing } from '@/lib/uploadthing';
import ImageGrid from '@/components/settings/settings-image-grid';

interface MediaUploaderProps {
  initialImages: string[];
  onImagesChange: (images: string[]) => void;
  maxImages: number;
  endpoint: 'projectImage' | 'experienceImage' | 'postImage';
  label: string;
}

interface ImageData {
  url: string;
  aspectRatio: number;
}

const MediaUploader: React.FC<MediaUploaderProps> = ({
  initialImages,
  onImagesChange,
  maxImages,
  endpoint,
  label,
}) => {
  const [images, setImages] = useState<ImageData[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    setImages(initialImages.map((url) => ({ url, aspectRatio: 1 })));
  }, [initialImages]);

  const { startUpload } = useUploadThing(endpoint, {
    onClientUploadComplete: useCallback(
      (res: { url: string }[]) => {
        setImages((prevImages) => {
          const newImageUrls = res.map((file) => ({
            url: file.url,
            aspectRatio: 1,
          }));
          const updatedImages = [...prevImages, ...newImageUrls].slice(
            0,
            maxImages,
          );
          onImagesChange(updatedImages.map((img) => img.url));
          return updatedImages;
        });
        setIsUploading(false);
      },
      [maxImages, onImagesChange],
    ),
    onUploadError: useCallback((error: Error) => {
      console.error(`Upload error: ${error.message}`);
      setIsUploading(false);
    }, []),
  });

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (files && files.length > 0) {
        setIsUploading(true);
        await startUpload(Array.from(files));
      }
    },
    [startUpload],
  );

  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      handleFiles(event.target.files);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    [handleFiles],
  );

  const handleRemoveImage = useCallback(
    (imageUrl: string) => {
      setImages((prevImages) => {
        const updatedImages = prevImages.filter((img) => img.url !== imageUrl);
        onImagesChange(updatedImages.map((img) => img.url));
        return updatedImages;
      });
    },
    [onImagesChange],
  );

  const handleImageLoad = useCallback(
    (index: number, event: React.SyntheticEvent<HTMLImageElement>) => {
      const { naturalWidth, naturalHeight } = event.currentTarget;
      setImages((prevImages) =>
        prevImages.map((img, i) =>
          i === index
            ? {
                ...img,
                aspectRatio: naturalWidth / naturalHeight,
              }
            : img,
        ),
      );
    },
    [],
  );

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      const files = e.dataTransfer.files;
      handleFiles(files);
    },
    [handleFiles],
  );

  return (
    <Flex direction="column" gap="3" my="3">
      <Text as="span" mb="3">
        {label} (optional, max {maxImages})
      </Text>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        style={{ display: 'none' }}
        multiple
      />
      {images.length < maxImages && !isUploading && (
        <Box
          onClick={() => fileInputRef.current?.click()}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className={`border-gray-a8 cursor-pointer border-2 border-dashed p-4 text-center transition-colors hover:border-gray-a10 ${
            isDragging ? 'border-green-400 bg-gray-8' : ''
          }`}
        >
          <Text size="2">
            Drag and drop images here, or click to select files
          </Text>
        </Box>
      )}
      {isUploading && (
        <div className="flex items-center justify-center space-x-2">
          <Spinner />
          <Text size="2">Uploading...</Text>
        </div>
      )}
      {images.length > 0 && (
        <ImageGrid
          images={images}
          onRemoveImage={handleRemoveImage}
          onImageLoad={handleImageLoad}
        />
      )}
    </Flex>
  );
};

export default MediaUploader;
