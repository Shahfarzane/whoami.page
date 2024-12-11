'use client';

import React, { useCallback, useState, useRef, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { BookmarkFilledIcon, BookmarkIcon } from '@radix-ui/react-icons';
import BaseIconButton from '@/components/buttons/base-icon-button';
import { useAuthStore } from '@/store/auth';
import { toggleBookmark } from '@/app/_actions/posts';

export interface BookmarkButtonProps {
  id: string;
  isBookmarked: boolean;
  onBookmark?: () => void;
}

export default function BookmarkButton({
  id,
  isBookmarked,
  onBookmark,
}: BookmarkButtonProps) {
  const { user: loggedUser, isLoaded } = useUser();
  const openSignInModal = useAuthStore((state) => state.openSignInModal);
  const queryClient = useQueryClient();
  const [localIsBookmarked, setLocalIsBookmarked] = useState(isBookmarked);
  const isUpdatingRef = useRef(false);

  useEffect(() => {
    if (!isUpdatingRef.current) {
      setLocalIsBookmarked(isBookmarked);
    }
  }, [isBookmarked]);

  const updateCache = useCallback(
    (newIsBookmarked: boolean) => {
      queryClient.setQueriesData({ queryKey: ['posts'] }, (old: any) => {
        if (!old?.pages) return old;
        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            data: page.data.map((post: any) =>
              post.id === id
                ? {
                    ...post,
                    isBookmarked: { isBookmarkedByUser: newIsBookmarked },
                  }
                : post,
            ),
          })),
        };
      });
    },
    [id, queryClient],
  );

  const { mutate, isPending } = useMutation({
    mutationFn: () => toggleBookmark(id),
    onMutate: async () => {
      if (!loggedUser) {
        openSignInModal();
        return;
      }

      isUpdatingRef.current = true;
      const newIsBookmarked = !localIsBookmarked;

      // Optimistic update
      setLocalIsBookmarked(newIsBookmarked);
      updateCache(newIsBookmarked);

      return { previousIsBookmarked: localIsBookmarked };
    },
    onError: (_, __, context) => {
      // Revert optimistic update
      if (context) {
        setLocalIsBookmarked(context.previousIsBookmarked);
        updateCache(context.previousIsBookmarked);
      }
      toast.error('Failed to update bookmark');
    },
    onSuccess: (isBookmarked) => {
      toast.success(
        isBookmarked ? 'Added to bookmarks' : 'Removed from bookmarks',
      );
    },
    onSettled: () => {
      isUpdatingRef.current = false;
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });

  const handleBookmark = useCallback(() => {
    if (!loggedUser) {
      openSignInModal();
      return;
    }
    if (isPending || !isLoaded) return;
    mutate();
  }, [loggedUser, openSignInModal, mutate, isPending, isLoaded]);

  if (!isLoaded) return null;

  return (
    <BaseIconButton
      icon={
        localIsBookmarked ? (
          <BookmarkFilledIcon className="h-4 w-4 text-green-500" />
        ) : (
          <BookmarkIcon className="h-4 w-4 hover:text-green-500" />
        )
      }
      tooltipContent={
        loggedUser
          ? localIsBookmarked
            ? 'Remove from bookmarks'
            : 'Add to bookmarks'
          : 'Sign in to bookmark'
      }
      onClick={handleBookmark}
      disabled={isPending}
      color={localIsBookmarked ? 'green' : 'gray'}
      ariaLabel={localIsBookmarked ? 'Remove bookmark' : 'Add bookmark'}
    />
  );
}
