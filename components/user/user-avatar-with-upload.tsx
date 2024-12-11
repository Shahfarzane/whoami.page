'use client';

import React from 'react';
import { Avatar, Box } from '@radix-ui/themes';
import { Pencil1Icon } from '@radix-ui/react-icons';

interface AvatarWithUploadProps {
  profileImage: string;
  username: string;
  edit: boolean;
  isImageUploading: boolean;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function AvatarWithUpload({
  profileImage,
  username,
  edit,
  isImageUploading,
  handleFileChange,
}: AvatarWithUploadProps) {
  return (
    <Box className="relative">
      <Avatar
        size="6"
        src={profileImage || undefined}
        fallback={username[0]?.toUpperCase() ?? ''}
        radius="full"
        className={isImageUploading ? 'opacity-50' : ''}
      />
      {edit && (
        <label
          htmlFor="avatar-upload"
          className="bg-gray-3 absolute bottom-0 right-0 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full hover:bg-gray-4"
        >
          <input
            id="avatar-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
            disabled={isImageUploading}
          />
          <Pencil1Icon className="h-3 w-3" />
        </label>
      )}
    </Box>
  );
}
