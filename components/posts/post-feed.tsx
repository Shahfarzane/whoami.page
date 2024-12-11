'use client';

import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { useInfiniteQuery, InfiniteData } from '@tanstack/react-query';
import PostItemWithHandlers from '@/components/posts/post-item-handlers';
import { BasePost as PostType, PostViewType } from '@/types/posts';
import { Box, Container, Flex } from '@radix-ui/themes';
import { useInView } from 'react-intersection-observer';
import ErrorBoundary from '@/components/error-boundary';
import PostsTabs from '@/components/posts-tabs';
import { SignedIn } from '@clerk/nextjs';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import ErrorState from '@/components/error-state';
import PostItemSkeleton from '@/components/posts/post-item-skeleton';
import NewPostDialog from '@/components/create-dialog';
import { fetchPosts } from '@/app/_actions/posts';
import { useAuth } from '@clerk/nextjs';
import { PaginatedResponse } from '@/types';
import { usePostInteractions } from '@/hooks/usePostInteractions';
import { Post, PostWithContext } from '@/types';

interface PostFeedProps {
  initialPosts: PaginatedResponse<PostWithContext>;
  view: PostViewType;
  username?: string;
}

export default React.memo(
  function PostFeed({ initialPosts, view, username = '' }: PostFeedProps) {
    const { userId } = useAuth();
    const [currentView, setCurrentView] = useState<PostViewType>(view);
    const [isLoading, setIsLoading] = useState(true);
    const [isPending, setIsPending] = useState(false);
    const [showHeaderTabs, setShowHeaderTabs] = useState(false);
    const [currentPostId, setCurrentPostId] = useState('');

    const { ref, inView } = useInView({
      threshold: 0,
      rootMargin: '400px',
      triggerOnce: false,
    });

    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    const isUserPostsPage = !!username;

    const {
      data,
      fetchNextPage,
      hasNextPage,
      isFetchingNextPage,
      error,
      isFetching,
    } = useInfiniteQuery<
      PaginatedResponse<PostWithContext>,
      Error,
      InfiniteData<PaginatedResponse<PostWithContext>>,
      [string, PostViewType, string | null],
      string | null
    >({
      queryKey: ['posts', currentView, userId ?? null],
      queryFn: async ({ pageParam }) => {
        return fetchPosts({
          view: currentView,
          userId,
          cursor: pageParam ? String(pageParam) : undefined,
          limit: 10,
        });
      },
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      initialPageParam: null,
      initialData: {
        pages: [initialPosts as PaginatedResponse<PostWithContext>],
        pageParams: [null],
      },
      staleTime: 30 * 1000,
      gcTime: 5 * 60 * 1000,
      refetchOnMount: true,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      enabled: !!userId,
    });

    const { handleLike, handleReply } = usePostInteractions(currentPostId);

    useEffect(() => {
      if (data?.pages) {
        setIsLoading(false);
      }
    }, [data]);

    const handleViewChange = useCallback(
      (newView: PostViewType) => {
        setIsPending(true);
        const params = new URLSearchParams(searchParams);
        if (newView === 'all') {
          params.delete('view');
        } else {
          params.set('view', newView);
        }
        setCurrentView(newView);
        router.push(`${pathname}?${params.toString()}`);
        setIsPending(false);
      },
      [pathname, router, searchParams],
    );

    const handleFetchNext = useCallback(() => {
      if (inView && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

    useEffect(() => {
      handleFetchNext();
    }, [handleFetchNext]);

    useEffect(() => {
      const viewFromParams = searchParams.get('view') as PostViewType;
      if (viewFromParams && viewFromParams !== currentView) {
        setCurrentView(viewFromParams);
      }
    }, [searchParams, currentView]);

    const content = useMemo(() => {
      if (isLoading || !data?.pages) return null;

      const allPosts = data.pages.flatMap((page) => page.data);

      if (allPosts.length === 0 && !isFetching) {
        return <p className="text-sm text-gray-500">No posts found</p>;
      }

      return (
        <>
          {allPosts.map((post) => {
            const handlePostLike = async () => {
              setCurrentPostId(post.id);
              await handleLike();
            };

            const handlePostReply = async (text: string) => {
              setCurrentPostId(post.id);
              await handleReply(text);
            };

            return (
              <PostItemWithHandlers
                key={post.id}
                post={{
                  ...post,
                  view: currentView,
                  updatedAt: post.createdAt,
                  authorId: post.author.id,
                  parentId: null,
                  quoteId: null,
                  _count: {
                    replyCount: post.count.replyCount,
                    likeCount: post.count.likeCount,
                    repostCount: post.count.repostCount,
                  },
                  interaction: {
                    hasLiked: post.isLiked,
                    hasBookmarked: post.isBookmarked.isBookmarkedByUser,
                    hasReposted: false,
                  },
                  likes: post.likes ?? [],
                  replies: (post.replies ?? []).map((reply) => ({
                    ...reply,
                    updatedAt: reply.createdAt,
                    authorId: reply.author.id,
                    parentId: post.id,
                    quoteId: null,
                    likes: [],
                    replies: [],
                    reposts: [],
                    _count: {
                      likeCount: 0,
                      replyCount: 0,
                      repostCount: 0,
                    },
                    interaction: {
                      hasLiked: false,
                      hasBookmarked: false,
                      hasReposted: false,
                    },
                    count: {
                      likeCount: 0,
                      replyCount: 0,
                      repostCount: 0,
                    },
                  })),
                  reposts: post.reposts ?? [],
                }}
                handlers={{
                  onLike: handlePostLike,
                  onReply: handlePostReply,
                }}
              />
            );
          })}
          {(hasNextPage || isFetching) && (
            <div ref={ref} className="flex h-20 items-center justify-center">
              <PostItemSkeleton />
            </div>
          )}
        </>
      );
    }, [
      data?.pages,
      currentView,
      handleLike,
      handleReply,
      hasNextPage,
      isFetching,
      ref,
      isLoading,
      isUserPostsPage,
    ]);

    if (error) return <ErrorState />;

    return (
      <ErrorBoundary fallback={<ErrorState />}>
        <Container size="2">
          <Flex
            direction="column"
            style={{
              borderLeft: '1px solid var(--gray-4)',
              borderRight: '1px solid var(--gray-4)',
              maxWidth: '600px',
              margin: '0 auto',
              position: 'relative',
            }}
          >
            <Box
              position="sticky"
              top="0"
              style={{
                backgroundColor: 'var(--color-background)',
                borderBottom: '1px solid var(--gray-4)',
                zIndex: 10,
                backdropFilter: 'blur(12px)',
                width: '100%',
              }}
            >
              {!showHeaderTabs && !isUserPostsPage && (
                <Box>
                  <PostsTabs
                    currentView={currentView}
                    onViewChange={handleViewChange}
                    currentUserId={userId ?? null}
                  />
                  <SignedIn>
                    <NewPostDialog variant="inline" />
                  </SignedIn>
                </Box>
              )}
            </Box>

            <Box className="min-h-screen pb-20">
              <Flex direction="column" gap="3">
                {content}
              </Flex>
            </Box>
          </Flex>
        </Container>
      </ErrorBoundary>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.view === nextProps.view &&
      prevProps.username === nextProps.username &&
      prevProps.initialPosts.data.length === nextProps.initialPosts.data.length
    );
  },
);
