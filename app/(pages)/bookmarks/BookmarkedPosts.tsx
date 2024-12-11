'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import PostItemHandlers from '@/components/posts/post-item-handlers';
import { Button } from '@radix-ui/themes';
import { getBookmarks } from '@/app/_actions/posts';
import { PaginatedResponse, PostWithContext } from '@/types';

interface BookmarkedPostsProps {
  initialData: PaginatedResponse<PostWithContext>;
  userId: string;
}

export function BookmarkedPosts({ initialData, userId }: BookmarkedPostsProps) {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery<PaginatedResponse<PostWithContext>>({
      queryKey: ['posts', 'bookmarks', userId],
      queryFn: ({ pageParam }) =>
        getBookmarks({
          cursor: pageParam as string | null,
          userId,
        }),
      getNextPageParam: (lastPage) => lastPage.nextCursor ?? null,
      initialPageParam: null,
      initialData: { pages: [initialData], pageParams: [null] },
    });

  const posts = data?.pages.flatMap((page) => page.data) ?? [];

  if (posts.length === 0) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-gray-500">
        You don't have any bookmarks yet.
      </div>
    );
  }

  return (
    <div className="mb-4 flex-grow pb-10">
      {posts.map((post) => (
        <PostItemHandlers key={post.id} post={{ ...post, view: 'all' }} />
      ))}

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

      {!hasNextPage && (
        <div className="py-4 text-center text-gray-500">
          No more posts to load.
        </div>
      )}
    </div>
  );
}
