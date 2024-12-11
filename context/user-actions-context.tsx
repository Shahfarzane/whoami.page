'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { generateReactHelpers } from '@uploadthing/react/hooks';
import { OurFileRouter } from '@/app/api/uploadthing/core';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateUserImage } from '@/app/_actions/user';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';

const { useUploadThing } = generateReactHelpers<OurFileRouter>();

interface UserActionsContextProps {
  handleFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  isImageUploading: boolean;
  uploadProgress: number;
  profileImage: string;
  setProfileImage: (url: string) => void;
}

const UserActionsContext = createContext<UserActionsContextProps | undefined>(
  undefined,
);

export const useUserActions = () => {
  const context = useContext(UserActionsContext);
  if (!context) {
    throw new Error('useUserActions must be used within a UserActionsProvider');
  }
  return context;
};

export const UserActionsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isImageUploading, setIsImageUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [profileImage, setProfileImage] = useState<string>('');
  const { startUpload, isUploading } = useUploadThing('postImage', {
    onUploadProgress: (progress) => {
      setUploadProgress(progress);
    },
    onClientUploadComplete: (res) => {
      if (res?.[0]) {
        setProfileImage(res[0].url);
      }
    },
    onUploadError: (error) => {
      toast.error('Failed to upload image');
    },
  });
  const { user } = useUser();

  const updateUserImageMutation = useMutation({
    mutationFn: async (profileImageUrl: string) => {
      const formData = new FormData();
      formData.append('profileImageUrl', profileImageUrl);
      await updateUserImage(formData);
      const response = await fetch(profileImageUrl);
      const blob = await response.blob();
      const file = new File([blob], 'profile.jpg', { type: blob.type });

      await user?.setProfileImage({ file });
    },
    onSuccess: () => {
      toast.success('Profile image updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['user'] });
      router.refresh();
    },
    onError: (error: any) => {
      toast.error(`Image update failed: ${error.message}`);
    },
  });

  const MAX_RETRIES = 3;
  const handleFileChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      let retries = 0;
      while (retries < MAX_RETRIES) {
        try {
          const file = event.target.files ? event.target.files[0] : null;
          if (file) {
            setIsImageUploading(true);
            setUploadProgress(0);
            try {
              const uploadResults = await startUpload([file]);
              if (uploadResults && uploadResults[0]?.url) {
                setProfileImage(uploadResults[0]?.url);
                updateUserImageMutation.mutate(uploadResults[0]?.url);
              }
            } finally {
              setIsImageUploading(false);
              setUploadProgress(100);
            }
          }
          break;
        } catch (error) {
          retries++;
          if (retries === MAX_RETRIES) {
            toast.error('Failed to upload image after multiple attempts');
            throw error;
          }
          await new Promise((resolve) => setTimeout(resolve, 1000 * retries));
        }
      }
    },
    [startUpload, updateUserImageMutation],
  );

  return (
    <UserActionsContext.Provider
      value={{
        handleFileChange,
        isImageUploading,
        uploadProgress,
        profileImage,
        setProfileImage,
      }}
    >
      {children}
    </UserActionsContext.Provider>
  );
};
