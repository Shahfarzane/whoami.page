import { Suspense } from 'react';
import { Container, Box } from '@radix-ui/themes';
import { auth } from '@clerk/nextjs/server';
import { notFound } from 'next/navigation';
import PostController from '@/components/post-controller';
import { unstable_cache } from 'next/cache';
import prisma from '@/app/_lib/db';
import { getPostInclude } from '@/app/_lib/posts/includes';
import { formatPost } from '@/app/_lib/posts/format';
import PostReplies from '@/components/posts/post-replies';
import PostItemHandlers from '@/components/posts/post-item-handlers';
import { Post } from '@/types';
import { Metadata } from 'next';

const getSinglePost = unstable_cache(
  async (postId: string, userId: string | null) => {
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        ...getPostInclude(userId),
        replies: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: getPostInclude(userId),
        },
      },
    });
    return post ? formatPost(post, userId) : null;
  },
  ['post'],
  {
    revalidate: 1,
    tags: ['post', 'posts', 'posts-all-views'],
  },
);

async function SinglePostContent({
  username,
  postId,
}: {
  username: string;
  postId: string;
}) {
  const { userId } = await auth();
  const post = await getSinglePost(postId, userId);

  if (!post || post.author.username !== username) notFound();

  return (
    <Container size="2">
      <Suspense fallback={<div>Loading...</div>}>
        <PostItemHandlers post={{ ...post, view: 'single' }} />
        {userId && (
          <Box
            position="sticky"
            top="0"
            className="z-10 w-full border-b border-gray-4"
          >
            <PostController
              isReply={true}
              postId={postId}
              formId={`reply-${postId}`}
            />
          </Box>
        )}
        {post.replies?.length > 0 && (
          <>
            <Box className="py-4 text-lg font-medium text-gray-900">
              Replies:
            </Box>
            <PostReplies
              parentPost={post as Post}
              initialReplies={{
                data: post.replies,
                nextCursor: null,
                hasNextPage: false,
              }}
            />
          </>
        )}
      </Suspense>
    </Container>
  );
}

export default function SinglePostPage({
  params: { username, postId },
}: {
  params: { username: string; postId: string };
}) {
  return (
    <div className="min-h-screen">
      <Suspense>
        <SinglePostContent username={username} postId={postId} />
      </Suspense>
    </div>
  );
}

export async function generateMetadata({
  params,
}: {
  params: { username: string; postId: string };
}): Promise<Metadata> {
  const post = await getSinglePost(params.postId, null);

  if (!post) {
    return { title: 'Post not found' };
  }

  const title = `${post.text.slice(0, 50)}... - ${post.author.username}`;
  const description = post.text.slice(0, 160);
  const url = process.env.NEXT_PUBLIC_APP_URL || 'https://whoami.page';

  return {
    title,
    description,
    metadataBase: new URL(url),
    openGraph: {
      title,
      description,
      url: `${url}/${params.username}/posts/${params.postId}`,
      type: 'article',
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
  } satisfies Metadata;
}
