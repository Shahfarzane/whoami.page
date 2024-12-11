// hooks/useOptimisticRepost.ts
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toggleRepost } from '@/app/_actions/posts';
import { toast } from 'sonner';

export const useOptimisticRepost = (
  postId: string,
  initialIsReposted: boolean,
) => {
  const queryClient = useQueryClient();
  const [optimisticIsReposted, setOptimisticIsReposted] =
    useState(initialIsReposted);

  const repostMutation = useMutation({
    mutationFn: () => toggleRepost(postId),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['posts'] });
      const previousPosts = queryClient.getQueryData(['posts']);

      setOptimisticIsReposted(!optimisticIsReposted);

      queryClient.setQueryData(['posts'], (oldData: any) => {
        if (!oldData || !oldData.pages) return oldData;
        return {
          ...oldData,
          pages: oldData.pages.map((page: any) => ({
            ...page,
            posts: page.posts.map((post: any) =>
              post.id === postId
                ? {
                    ...post,
                    reposts: optimisticIsReposted
                      ? post.reposts.filter(
                          (repost: any) => repost.userId !== post.currentUserId,
                        )
                      : [...post.reposts, { userId: post.currentUserId }],
                    count: {
                      ...post.count,
                      repostCount: optimisticIsReposted
                        ? post.count.repostCount - 1
                        : post.count.repostCount + 1,
                    },
                  }
                : post,
            ),
          })),
        };
      });

      return { previousPosts };
    },
    onError: (error, variables, context) => {
      queryClient.setQueryData(['posts'], context?.previousPosts);
      setOptimisticIsReposted(!optimisticIsReposted);
      toast.error('Failed to update repost status. Please try again.');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });

  return { optimisticIsReposted, repostMutation };
};
