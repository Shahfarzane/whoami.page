'use client';

import React, { useState, useCallback } from 'react';
import {
  Box,
  Button,
  Flex,
  Avatar,
  Select,
  Text,
  Progress,
} from '@radix-ui/themes';
import { toast } from 'sonner';
import { ResizeTextarea } from '@/components/ui/resize-textarea';
import { generateReactHelpers } from '@uploadthing/react/hooks';
import { OurFileRouter } from '@/app/api/uploadthing/core';
import { Icons } from '@/components/ui/icons';
import Image from 'next/image';
import { Cross2Icon } from '@radix-ui/react-icons';
import { ReplyPrivacy } from '@prisma/client';
import { useQueryClient } from '@tanstack/react-query';

const { useUploadThing } = generateReactHelpers<OurFileRouter>();

interface PostComposerFormProps {
  onSubmit: (formData: FormData) => Promise<void>;
  placeholder?: string;
  initialText?: string;
  showPrivacySettings?: boolean;
  onClose?: () => void;
  isSubmitting?: boolean;
  showAvatar?: boolean;
  user?: {
    profileImage: string | null;
    username: string;
  };
  formId?: string;
}

export function PostComposerForm({
  onSubmit,
  placeholder = "What's happening?",
  initialText = '',
  showPrivacySettings = false,
  onClose,
  isSubmitting: externalIsSubmitting = false,
  showAvatar = false,
  user,
  formId = 'main',
}: PostComposerFormProps) {
  const [inputValue, setInputValue] = useState(initialText);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewURLs, setPreviewURLs] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [privacy, setPrivacy] = useState<ReplyPrivacy>(ReplyPrivacy.PUBLIC);
  const { startUpload } = useUploadThing('postImage', {
    onUploadProgress: useCallback((progressEvent: number) => {
      setUploadProgress(progressEvent);
    }, []),
    onUploadBegin: useCallback(() => {
      setIsUploading(true);
      setUploadProgress(0);
    }, []),
  });

  const uploadInputId = `image-upload-${formId}`;

  const handleImageUpload = useCallback(
    (files: FileList) => {
      const newFiles = Array.from(files).slice(0, 4 - selectedFiles.length);
      const validFiles = newFiles.filter((file) => {
        const isValidSize = file.size <= 5 * 1024 * 1024;
        const isValidType = file.type.startsWith('image/');
        if (!isValidSize) toast.error(`File ${file.name} exceeds 5MB limit`);
        if (!isValidType) toast.error(`File ${file.name} is not an image`);
        return isValidSize && isValidType;
      });

      const newPreviewURLs = validFiles.map(URL.createObjectURL);
      setSelectedFiles((prev) => [...prev, ...validFiles]);
      setPreviewURLs((prev) => [...prev, ...newPreviewURLs]);
    },
    [selectedFiles],
  );

  const handleImageRemove = useCallback((index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviewURLs((prev) => {
      const url = prev[index];
      if (url) URL.revokeObjectURL(url);
      return prev.filter((_, i) => i !== index);
    });
  }, []);

  const [localIsSubmitting, setLocalIsSubmitting] = useState(false);

  const queryClient = useQueryClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() && selectedFiles.length === 0) return;

    // Create optimistic post
    const optimisticPost = {
      id: `temp-${Date.now()}`,
      text: inputValue,
      images: [],
      createdAt: new Date().toISOString(),
      author: user,
      _count: { likeCount: 0, replyCount: 0, repostCount: 0 },
      isLiked: false,
      isBookmarked: { isBookmarkedByUser: false },
    };

    // Add optimistic update
    queryClient.setQueryData(['posts'], (old: any) => ({
      ...old,
      data: [optimisticPost, ...(old?.data ?? [])],
    }));

    try {
      setLocalIsSubmitting(true);
      setIsUploading(true);
      setUploadProgress(10);

      let imageUrls: string[] = [];

      if (selectedFiles.length > 0) {
        setUploadProgress(30);
        const uploadPromise = startUpload(selectedFiles);

        const progressInterval = setInterval(() => {
          setUploadProgress((prev) => Math.min(prev + 10, 90));
        }, 500);

        const results = await uploadPromise;
        clearInterval(progressInterval);

        imageUrls = results?.map((r) => r.url) ?? [];
        setUploadProgress(100);
      }

      const formData = new FormData();
      formData.append('text', inputValue.trim());
      formData.append('replyPrivacy', privacy);
      imageUrls.forEach((url) => formData.append('images', url));

      await onSubmit(formData);
      setInputValue('');
      setSelectedFiles([]);
      setPreviewURLs([]);
      onClose?.();

      // After successful submission, invalidate to get real data
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    } catch (error) {
      // On error, revert optimistic update
      queryClient.setQueryData(['posts'], (old: any) => ({
        ...old,
        data:
          old?.data?.filter((post: any) => post.id !== optimisticPost.id) ?? [],
      }));
      setIsUploading(false);
      setUploadProgress(0);
      toast.error('Failed to create post');
    } finally {
      setLocalIsSubmitting(false);
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const isFormSubmitting = externalIsSubmitting || localIsSubmitting;

  const ImagePreview = ({
    file,
    onRemove,
  }: {
    file: File;
    onRemove: () => void;
  }) => {
    const [objectUrl, setObjectUrl] = React.useState<string>('');

    React.useEffect(() => {
      const url = URL.createObjectURL(file);
      setObjectUrl(url);
      return () => URL.revokeObjectURL(url);
    }, [file]);

    if (!objectUrl) return null;

    return (
      <div className="relative h-[200px] w-[200px]">
        <Image
          src={objectUrl}
          alt="Preview"
          fill
          sizes="200px"
          className="rounded-lg object-cover"
          priority
        />
        <button
          type="button"
          onClick={onRemove}
          className="absolute right-2 top-2 rounded-full bg-black/50 p-1 text-white hover:bg-black/70"
        >
          <Cross2Icon className="h-4 w-4" />
        </button>
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit} className="my-4">
      <Flex direction="column" gap="3">
        <Flex gap="3" align="start">
          {showAvatar && user && (
            <Avatar
              radius="full"
              src={user.profileImage ?? ''}
              fallback={user.username?.[0] ?? 'U'}
              size="2"
            />
          )}
          <Flex direction="column" gap="3" className="w-full">
            <ResizeTextarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={placeholder}
              maxLength={280}
            />

            <Flex align="center" gap="3">
              <Button
                type="button"
                variant="ghost"
                onClick={() => document.getElementById(uploadInputId)?.click()}
                disabled={selectedFiles.length >= 4}
              >
                <Icons.image className="h-5 w-5" />
                <input
                  id={uploadInputId}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) =>
                    e.target.files && handleImageUpload(e.target.files)
                  }
                />
              </Button>
            </Flex>

            {previewURLs.length > 0 && (
              <Flex wrap="wrap" gap="2">
                {previewURLs.map((url, index) => {
                  const file = selectedFiles[index];
                  if (!file) return null;

                  return (
                    <Box key={url} position="relative">
                      <ImagePreview
                        file={file}
                        onRemove={() => handleImageRemove(index)}
                      />
                    </Box>
                  );
                })}
              </Flex>
            )}

            <Flex justify="between" align="center" gap="3">
              {showPrivacySettings && (
                <Select.Root
                  value={privacy}
                  onValueChange={(value) => setPrivacy(value as ReplyPrivacy)}
                >
                  <Select.Trigger variant="soft">
                    {privacy === ReplyPrivacy.PUBLIC
                      ? 'Public'
                      : 'Followers Only'}
                  </Select.Trigger>
                  <Select.Content>
                    <Select.Item value={ReplyPrivacy.PUBLIC}>
                      Public
                    </Select.Item>
                    <Select.Item value={ReplyPrivacy.FOLLOWERS_ONLY}>
                      Followers Only
                    </Select.Item>
                  </Select.Content>
                </Select.Root>
              )}

              <Button
                type="submit"
                variant="soft"
                disabled={
                  isFormSubmitting ||
                  isUploading ||
                  (!inputValue.trim() && !selectedFiles.length)
                }
              >
                {isFormSubmitting || isUploading ? 'Posting...' : 'Post'}
              </Button>
            </Flex>

            {isUploading && selectedFiles.length > 0 && (
              <div className="mt-2">
                <Progress value={uploadProgress} className="h-1" />
                <Text size="1" color="gray" className="mt-1">
                  {uploadProgress < 100
                    ? 'Uploading images...'
                    : 'Upload complete'}
                </Text>
              </div>
            )}
          </Flex>
        </Flex>
      </Flex>
    </form>
  );
}
