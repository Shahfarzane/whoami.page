import { Suspense } from 'react';
import PostFeed from '@/components/posts/post-feed';
import { notFound } from 'next/navigation';
import { unstable_cache } from 'next/cache';
import { auth } from '@clerk/nextjs/server';
import PostFeedSkeleton from '@/components/post-feed-skeleton';
import prisma from '@/app/_lib/db';
import { getPostInclude } from '@/app/_lib/posts/includes';
import { formatPost } from '@/app/_lib/posts/format';

export const revalidate = 30;

const getUserWithPosts = unstable_cache(
  async (username: string, userId: string | null) => {
    const [user, posts] = await Promise.all([
      prisma.user.findUnique({
        where: { username },
        select: { username: true, followers: true },
      }),
      prisma.post.findMany({
        where: {
          AND: [{ author: { username } }, { parentId: null }],
        },
        take: 10,
        include: getPostInclude(userId),
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    if (!user) return null;

    return {
      user,
      posts: {
        data: posts.map((post) => formatPost(post, userId)),
        nextCursor: null,
        hasNextPage: false,
      },
    };
  },
  ['user-profile-posts'],
  { revalidate: 3600, tags: ['posts', 'user-data'] },
);

async function UserPostsContent({ username }: { username: string }) {
  const { userId } = await auth();
  const data = await getUserWithPosts(username, userId);
  if (!data) notFound();

  return <PostFeed initialPosts={data.posts} view="user" username={username} />;
}

export default function UserPostsPage({
  params: { username },
}: {
  params: { username: string };
}) {
  return (
    <div className="min-h-screen">
      <Suspense fallback={<PostFeedSkeleton />}>
        <UserPostsContent username={username} />
      </Suspense>
    </div>
  );
}
