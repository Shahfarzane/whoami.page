import { useQueryClient } from '@tanstack/react-query';
import {
  toggleRepost,
  toggleBookmark,
  toggleLike,
  createPost,
  replyToPost,
} from '@/app/_actions/posts';
import { useState, useCallback, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { toast } from 'sonner';
import { Post, PaginatedResponse } from '@/types';

export function usePostInteractions(postId: string) {
  const queryClient = useQueryClient();
  const { user: currentUser } = useUser();
  const userId = currentUser?.id;

  // Initialize optimistic states from server state
  const [optimisticStates, setOptimisticStates] = useState({
    like: false,
    repost: false,
    bookmark: false,
  });

  // Update optimistic state when server state changes
  useEffect(() => {
    const currentPost = queryClient
      .getQueryData<{ pages: Array<PaginatedResponse<Post>> }>(['posts'])
      ?.pages?.flatMap((page: PaginatedResponse<Post>) => page.data)
      .find((post: Post) => post.id === postId);

    if (currentPost?.interaction.hasLiked !== undefined) {
      setOptimisticStates((prev) => ({
        ...prev,
        like: currentPost.interaction.hasLiked,
      }));
    }
  }, [postId, queryClient, userId]);

  // Optimistic update helper with safety checks
  const updatePostCache = (
    key: 'likes' | 'reposts' | 'bookmarks',
    value: boolean,
  ) => {
    queryClient.setQueryData(['post', postId], (old: any) => {
      if (!old?.count) return old;
      return {
        ...old,
        [key]: value,
        count: {
          ...old.count,
          [`${key}Count`]: value
            ? (old.count[`${key}Count`] || 0) + 1
            : Math.max((old.count[`${key}Count`] || 0) - 1, 0),
        },
      };
    });
  };

  const [isLoading, setIsLoading] = useState({
    like: false,
    reply: false,
    repost: false,
    bookmark: false,
  });

  const updateCache = useCallback(
    (type: 'like' | 'bookmark' | 'repost', newValue: boolean) => {
      queryClient.setQueriesData({ queryKey: ['posts'] }, (old: any) => {
        if (!old?.pages) return old;
        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            data: page.data.map((post: any) =>
              post.id === postId
                ? {
                    ...post,
                    ...(type === 'like' && { isLiked: newValue }),
                    ...(type === 'bookmark' && {
                      isBookmarked: { isBookmarkedByUser: newValue },
                    }),
                    ...(type === 'repost' && { isReposted: newValue }),
                  }
                : post,
            ),
          })),
        };
      });
    },
    [postId, queryClient],
  );

  const handleInteraction = useCallback(
    async (
      type: 'like' | 'bookmark' | 'repost',
      action: typeof toggleLike | typeof toggleBookmark | typeof toggleRepost,
    ): Promise<void> => {
      if (isLoading[type]) return;

      setIsLoading((prev) => ({ ...prev, [type]: true }));
      try {
        // Optimistic update
        updateCache(type, true);
        const result = await action(postId);
        console.log(`[usePostInteractions] ${type} result:`, { result });
      } catch (error) {
        // Revert optimistic update
        updateCache(type, false);
        console.error(`[usePostInteractions] ${type} error:`, error);
        toast.error(`Failed to ${type} post`);
        throw error;
      } finally {
        setIsLoading((prev) => ({ ...prev, [type]: false }));
      }
    },
    [postId, isLoading, updateCache],
  );

  const handleLike = useCallback(async (): Promise<void> => {
    console.log('[usePostInteractions] Starting like:', { postId });
    await handleInteraction('like', toggleLike);
  }, [postId, handleInteraction]);

  const handleBookmark = useCallback(async (): Promise<void> => {
    await handleInteraction('bookmark', toggleBookmark);
  }, [handleInteraction]);

  const handleRepost = useCallback(async (): Promise<void> => {
    await handleInteraction('repost', toggleRepost);
  }, [handleInteraction]);

  const handleReply = useCallback(
    async (text: string) => {
      if (!text.trim()) return;

      const formData = new FormData();
      formData.append('text', text);
      formData.append('parentId', postId);

      try {
        await replyToPost(formData);
        toast.success('Reply posted successfully');
      } catch (error) {
        console.error('Reply failed:', error);
        toast.error('Failed to post reply');
        throw error;
      }
    },
    [postId],
  );

  return {
    handleLike,
    handleBookmark,
    handleRepost,
    handleReply,
    isLoading,
    optimisticStates,
  };
}
