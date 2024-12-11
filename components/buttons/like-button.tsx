'use client';

import React, { useCallback, useState, memo, useRef } from 'react';
import { useUser } from '@clerk/nextjs';
import { HeartFilledIcon, HeartIcon } from '@radix-ui/react-icons';
import BaseIconButton from '@/components/buttons/base-icon-button';
import { useAuthStore } from '@/store/auth';
import { useQueryClient } from '@tanstack/react-query';

export interface LikeButtonProps {
  id: string;
  isLiked: boolean;
  likeCount: number;
  onLike?: () => void;
}

export default memo(
  function LikeButton({ id, isLiked, likeCount, onLike }: LikeButtonProps) {
    const { user: loggedUser, isLoaded } = useUser();
    const openSignInModal = useAuthStore((state) => state.openSignInModal);
    const [isPending, setIsPending] = useState(false);
    const [localIsLiked, setLocalIsLiked] = useState(isLiked);
    const queryClient = useQueryClient();
    const isUpdatingRef = useRef(false);

    const updateCache = useCallback(
      (newIsLiked: boolean) => {
        queryClient.setQueriesData({ queryKey: ['posts'] }, (old: any) => {
          if (!old?.pages) return old;
          return {
            ...old,
            pages: old.pages.map((page: any) => ({
              ...page,
              data: page.data.map((post: any) =>
                post.id === id ? { ...post, isLiked: newIsLiked } : post,
              ),
            })),
          };
        });
      },
      [id, queryClient],
    );

    const handleLike = useCallback(async () => {
      if (!loggedUser || !isLoaded || !onLike) {
        openSignInModal();
        return;
      }

      if (isPending) return;

      setIsPending(true);
      isUpdatingRef.current = true;
      const newIsLiked = !localIsLiked;

      try {
        setLocalIsLiked(newIsLiked);
        updateCache(newIsLiked);
        await onLike();
      } catch (error) {
        setLocalIsLiked(!newIsLiked);
        updateCache(!newIsLiked);
      } finally {
        setIsPending(false);
        isUpdatingRef.current = false;
      }
    }, [
      loggedUser,
      isLoaded,
      isPending,
      localIsLiked,
      onLike,
      openSignInModal,
      updateCache,
    ]);

    if (!isLoaded) return null;

    return (
      <BaseIconButton
        icon={
          localIsLiked ? (
            <HeartFilledIcon className="h-4 w-4 text-red-500" />
          ) : (
            <HeartIcon className="h-4 w-4 hover:text-red-500" />
          )
        }
        tooltipContent={
          loggedUser ? (localIsLiked ? 'Unlike' : 'Like') : 'Sign in to like'
        }
        onClick={handleLike}
        disabled={isPending}
        color={localIsLiked ? 'red' : 'gray'}
        ariaLabel={localIsLiked ? 'Unlike post' : 'Like post'}
      />
    );
  },
  (prevProps, nextProps) => prevProps.isLiked === nextProps.isLiked,
);
