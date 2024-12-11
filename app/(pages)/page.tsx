import { Suspense } from 'react';
import { fetchPosts } from '@/app/_actions/posts';
import PostFeed from '@/components/posts/post-feed';
import { PostViewType } from '@/types/posts';
import { auth } from '@clerk/nextjs/server';
import { unstable_cache } from 'next/cache';

const INITIAL_POSTS_LIMIT = 10;

const getCachedPosts = unstable_cache(
  async ({
    view,
    userId,
    limit,
  }: {
    view: PostViewType;
    userId: string | null;
    limit: number;
  }) => {
    try {
      return await fetchPosts({
        view,
        userId: userId ?? undefined,
        limit,
      });
    } catch (error) {
      console.error('Error in getCachedPosts:', error);
      throw error;
    }
  },
  ['feed-posts'],
  {
    revalidate: 60,
    tags: ['posts', 'user-posts'],
  },
);

export default async function PostsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const view = (searchParams.view as PostViewType) || 'all';

  // Get auth first
  const { userId } = await auth();

  // Then fetch posts with the userId
  const initialPosts = await getCachedPosts({
    view,
    userId, // Pass the actual userId
    limit: INITIAL_POSTS_LIMIT,
  });

  return (
    <div className="min-h-screen">
      <Suspense>
        <PostFeed initialPosts={initialPosts} view={view} key={view} />
      </Suspense>
    </div>
  );
}
