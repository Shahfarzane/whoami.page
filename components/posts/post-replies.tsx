'use client';

import { memo } from 'react';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { fetchReplies } from '@/app/_actions/posts';
import PostItemHandlers from '@/components/posts/post-item-handlers';
import { Button, Flex } from '@radix-ui/themes';
import { Post, PaginatedResponse } from '@/types';
import { PostItemProps } from '@/types/posts';
import { useCallback, useEffect } from 'react';
import UserPostRepliesImages from '@/components/user/user-post-replies-images';
import { usePostInteractions } from '@/hooks/usePostInteractions';

interface PostRepliesProps {
  parentPost: Post;
  initialReplies: PaginatedResponse<Post>;
}

const PostReplies = memo(function PostReplies({
  parentPost,
  initialReplies,
}: PostRepliesProps) {
  const queryClient = useQueryClient();
  const queryKey = ['replies', parentPost.id];
  const { handleLike, handleReply } = usePostInteractions(parentPost.id);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, refetch } =
    useInfiniteQuery<PaginatedResponse<Post>>({
      queryKey,
      queryFn: async ({ pageParam }) =>
        fetchReplies(parentPost.id, pageParam as string | null),
      getNextPageParam: (lastPage) => lastPage.nextCursor ?? null,
      initialPageParam: null as string | null,
      initialData: initialReplies
        ? {
            pages: [initialReplies],
            pageParams: [null],
          }
        : undefined,
      staleTime: 0,
      refetchOnMount: true,
    });

  useEffect(() => {
    const unsubscribe = queryClient.getQueryCache().subscribe(() => {
      const query = queryClient.getQueryData(queryKey);
      if (!query) {
        refetch();
      }
    });

    return () => {
      unsubscribe();
    };
  }, [queryClient, queryKey, refetch]);

  const addOptimisticReply = useCallback(
    (newReply: Post) => {
      queryClient.setQueryData(
        queryKey,
        (old: any): { pages: PaginatedResponse<Post>[]; pageParams: any[] } => {
          if (!old?.pages?.[0]) {
            return {
              pages: [
                { data: [newReply], nextCursor: null, hasNextPage: false },
              ],
              pageParams: [null],
            };
          }

          const newPages = old.pages.map(
            (page: PaginatedResponse<Post>, index: number) =>
              index === 0 ? { ...page, data: [newReply, ...page.data] } : page,
          );

          return {
            ...old,
            pages: newPages,
          };
        },
      );

      queryClient.setQueryData(['post', parentPost.id], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          count: {
            ...old.count,
            replyCount: (old.count.replyCount || 0) + 1,
          },
        };
      });
    },
    [queryClient, queryKey, parentPost.id],
  );

  const replies = data?.pages?.flatMap((page) => page?.data ?? []) ?? [];

  if (!data) return null;

  return (
    <Flex direction="column" gap="2">
      {replies.length > 0 && (
        <>
          {replies.map((reply) => (
            <PostItemHandlers
              key={reply.id}
              post={{
                ...reply,
                view: 'replies' as const,
                _count: reply._count,
                count: reply.count,
                interaction: {
                  hasLiked: reply.interaction?.hasLiked ?? false,
                  hasReposted: reply.interaction?.hasReposted ?? false,
                  hasBookmarked: reply.interaction?.hasBookmarked ?? false,
                },
                likes: reply.likes ?? [],
                replies: reply.replies ?? [],
                reposts: reply.reposts ?? [],
              }}
              handlers={{
                onLike: () => handleLike(),
                onReply: (text: string) => handleReply(text),
              }}
              onReplySuccess={addOptimisticReply}
            />
          ))}
        </>
      )}

      {hasNextPage && (
        <div className="py-4 text-center">
          <Button
            onClick={() => !isFetchingNextPage && fetchNextPage()}
            disabled={isFetchingNextPage}
          >
            {isFetchingNextPage ? 'Loading more...' : 'Load more'}
          </Button>
        </div>
      )}
    </Flex>
  );
});

export default PostReplies;
