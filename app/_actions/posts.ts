'use server';

import { auth } from '@clerk/nextjs/server';
import { revalidateTag } from 'next/cache';
import { ReplyPrivacy, Prisma } from '@prisma/client';
import prisma, { executeWithRetry } from '@/app/_lib/db';
import { Post, PostWithContext, PaginatedResponse } from '@/types';
import { unstable_cache } from 'next/cache';
import { PostViewType } from '@/types/posts';
import { cache } from 'react';

type PrismaPost = {
  id: string;
  text: string;
  createdAt: Date;
  updatedAt: Date;
  images: string[];
  replyPrivacy: ReplyPrivacy;
  parentId: string | null;
  quoteId: string | null;
  author: {
    id: string;
    username: string;
    profileImage: string | null;
    fullName: string | null;
    verified: boolean | null;
    followers: Array<{ id: string }>;
  };
  replies?: Array<{
    id: string;
    text: string;
    createdAt: Date;
    author: {
      id: string;
      username: string;
      profileImage: string | null;
    };
  }>;
  _count: {
    likes: number;
    replies: number;
    reposts: number;
  };
  likes?: Array<{ userId: string }>;
  reposts?: Array<{ userId: string }>;
  bookmarks?: Array<{ userId: string }>;
};

// ============= Helper Functions =============
const getAuthenticatedUser = async () => {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');
  return userId;
};

// Create a shared cache for post includes
const getPostIncludeWithCache = cache((userId: string | null) => {
  return {
    author: {
      include: {
        followers: userId
          ? {
              where: { followerId: userId },
            }
          : false,
      },
    },
    likes: {
      where: userId ? { userId } : undefined,
    },
    bookmarks: {
      where: userId ? { userId } : undefined,
    },
    _count: {
      select: {
        likes: true,
        replies: true,
        reposts: true,
      },
    },
  } satisfies Prisma.PostInclude;
});

// Cache the post formatting
const formatPostWithCache = cache(
  async (post: any, userId: string | null): Promise<PostWithContext> => {
    return {
      ...post,
      author: {
        ...post.author,
        isFollowing: userId ? post.author.followers.length > 0 : false,
      },
      isLiked: userId
        ? post.likes.some((like: any) => like.userId === userId)
        : false,
      interaction: {
        hasLiked: userId
          ? post.likes.some((like: any) => like.userId === userId)
          : false,
        hasBookmarked: userId
          ? (post.bookmarks?.some((b: any) => b.userId === userId) ?? false)
          : false,
        hasReposted: false,
      },
      count: {
        likeCount: post._count.likes,
        replyCount: post._count.replies,
        repostCount: post._count.reposts,
      },
      replies: [],
      reposts: [],
      isBookmarked: {
        isBookmarkedByUser: userId
          ? (post.bookmarks?.some((b: any) => b.userId === userId) ?? false)
          : false,
      },
    };
  },
);

// ============= Post Creation and Modification =============
export async function createPost(formData: FormData): Promise<Post> {
  const text = formData.get('text') as string;
  const images = formData.getAll('images').map((img) => img.toString());
  const replyPrivacy =
    (formData.get('replyPrivacy') as ReplyPrivacy) || ReplyPrivacy.PUBLIC;
  const parentId = formData.get('parentId') as string | null;

  const userId = await getAuthenticatedUser();

  try {
    const post = await prisma.post.create({
      data: {
        text,
        authorId: userId,
        images,
        replyPrivacy,
        parentId,
      },
      include: getPostIncludeWithCache(userId),
    });

    // More granular cache invalidation
    if (parentId) {
      // For replies
      revalidateTag(`post-${parentId}`);
      revalidateTag(`replies-${parentId}`);
      revalidateTag(`post-replies-${parentId}`);
      revalidateTag(`thread-${parentId}`);
      revalidateTag('posts');
    }

    // Always invalidate these
    revalidateTag(`post-${post.id}`);
    revalidateTag('posts-recent');
    revalidateTag(`posts-user-${userId}`);
    revalidateTag(`posts-${post.id}`);
    revalidateTag('posts-all');
    revalidateTag('posts-all-views');
    revalidateTag(`user-profile-posts`);

    return formatPostWithCache(post, userId);
  } catch (error) {
    console.error('Error creating post:', error);
    throw new Error('Failed to create post');
  }
}

export async function deletePost(postId: string): Promise<void> {
  const userId = await getAuthenticatedUser();

  try {
    const post = await executeWithRetry(() =>
      prisma.post.findUnique({
        where: { id: postId },
        select: { parentId: true, authorId: true },
      }),
    );

    if (!post || post.authorId !== userId) {
      throw new Error('Unauthorized or post not found');
    }

    // Delete all replies first
    await executeWithRetry(() =>
      prisma.post.deleteMany({
        where: { parentId: postId },
      }),
    );

    // Then delete the post itself
    await executeWithRetry(() =>
      prisma.post.delete({
        where: { id: postId },
      }),
    );

    // Revalidate based on post type
    if (post.parentId) {
      // For replies
      revalidateTag(`post-${post.parentId}`);
      revalidateTag(`replies-${post.parentId}`);
      revalidateTag(`post-replies-${post.parentId}`);
    }

    // Always revalidate these
    revalidateTag(`post-${postId}`);
    revalidateTag('posts');
    revalidateTag(`posts-user-${userId}`);
    revalidateTag('posts-recent');
  } catch (error) {
    console.error('Error deleting post:', error);
    throw error;
  }
}

// ============= Post Interactions =============
async function toggleInteraction(
  postId: string,
  userId: string,
  type: 'like' | 'bookmark' | 'repost',
) {
  try {
    const result = await prisma.$transaction(async (tx) => {
      const model = tx[type] as unknown as {
        findFirst: (args: { where: any }) => Promise<any>;
        delete: (args: { where: any }) => Promise<any>;
        create: (args: { data: any }) => Promise<any>;
      };

      const where = {
        ...(type === 'like'
          ? { postId_userId: { postId, userId } }
          : type === 'bookmark'
            ? { userId_postId: { userId, postId } }
            : { postId_userId: { postId, userId } }),
      };

      const existing = await model.findFirst({
        where: {
          userId,
          postId,
        },
      });

      if (existing) {
        await model.delete({ where });
        return false;
      }

      await model.create({
        data: { postId, userId },
      });
      return true;
    });

    // Revalidate relevant tags
    revalidateTag(`post-${postId}`);
    revalidateTag('posts');
    revalidateTag(`posts-user-${userId}`);

    return result;
  } catch (error) {
    console.error(`Error in toggle${type}:`, error);
    throw error;
  }
}

export async function toggleLike(postId: string) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error('Unauthorized');

    const result = await prisma.$transaction(async (tx) => {
      const existing = await tx.like.findUnique({
        where: {
          postId_userId: { postId, userId },
        },
      });

      if (existing) {
        await tx.like.delete({
          where: {
            postId_userId: { postId, userId },
          },
        });
        return { isLiked: false };
      }

      const newLike = await tx.like.create({
        data: { postId, userId },
        select: { postId: true, userId: true },
      });

      // Fetch updated post to get correct counts
      const updatedPost = await tx.post.findUnique({
        where: { id: postId },
        include: getPostIncludeWithCache(userId),
      });

      return {
        isLiked: true,
        post: updatedPost
          ? await formatPostWithCache(updatedPost, userId)
          : null,
      };
    });

    // Revalidate with new data
    revalidateTag(`post-${postId}`);
    revalidateTag('posts');
    revalidateTag(`posts-user-${userId}`);
    revalidateTag('posts-all-views');

    return result;
  } catch (error) {
    throw error;
  }
}

// ============= Bookmarks =============
export const getBookmarks = unstable_cache(
  async ({
    cursor,
    limit = 10,
    userId,
  }: {
    cursor: string | null;
    limit?: number;
    userId: string;
  }): Promise<PaginatedResponse<PostWithContext>> => {
    try {
      if (!userId) throw new Error('Unauthorized');

      const posts = await prisma.post.findMany({
        where: {
          bookmarks: { some: { userId } },
        },
        take: limit + 1,
        ...(cursor && { skip: 1, cursor: { id: cursor } }),
        include: getPostIncludeWithCache(userId),
        orderBy: { createdAt: 'desc' },
      });

      const hasNextPage = posts.length > limit;
      const displayPosts = hasNextPage ? posts.slice(0, -1) : posts;
      const formattedPosts = await Promise.all(
        displayPosts.map((post) => formatPostWithCache(post, userId)),
      );

      return {
        data: formattedPosts,
        nextCursor: hasNextPage
          ? displayPosts[displayPosts.length - 1]!.id
          : null,
        hasNextPage,
      };
    } catch (error) {
      console.error('Error in getBookmarks:', error);
      throw error;
    }
  },
  ['bookmarks'],
  { revalidate: 30, tags: ['bookmarks'] },
);

export async function replyToPost(formData: FormData): Promise<Post> {
  const text = formData.get('text') as string;
  const parentId = formData.get('parentId') as string;
  const images = formData.getAll('images').map((img) => img.toString());

  // Create new FormData with all fields
  const newFormData = new FormData();
  newFormData.append('text', text);
  newFormData.append('parentId', parentId);
  images.forEach((img) => newFormData.append('images', img));

  return createPost(newFormData);
}

export async function fetchReplies(
  postId: string,
  cursor: string | null = null,
): Promise<PaginatedResponse<PostWithContext>> {
  try {
    const replies = await prisma.post.findMany({
      where: { parentId: postId },
      take: 10 + 1, // Take one extra to check for next page
      ...(cursor && { skip: 1, cursor: { id: cursor } }),
      include: getPostIncludeWithCache(null),
      orderBy: { createdAt: 'desc' },
    });

    const hasNextPage = replies.length > 10;
    const displayReplies = hasNextPage ? replies.slice(0, -1) : replies;
    const formattedReplies = await Promise.all(
      displayReplies.map((reply) => formatPostWithCache(reply, null)),
    );

    return {
      data: formattedReplies,
      nextCursor: hasNextPage
        ? (displayReplies[displayReplies.length - 1]?.id ?? null)
        : null,
      hasNextPage,
    };
  } catch (error) {
    console.error('Error fetching replies:', error);
    throw error;
  }
}

export async function toggleBookmark(postId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');
  return toggleInteraction(postId, userId, 'bookmark');
}

export async function toggleRepost(postId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');
  return toggleInteraction(postId, userId, 'repost');
}

// Simplify the post include configuration
const getPostInclude = cache(
  (userId: string | null): Prisma.PostInclude => ({
    author: {
      select: {
        id: true,
        username: true,
        profileImage: true,
        fullName: true,
        verified: true,
        followers: userId
          ? {
              where: { followerId: userId },
              select: { id: true },
            }
          : undefined,
      },
    },
    replies: {
      take: 3,
      select: {
        id: true,
        text: true,
        createdAt: true,
        author: {
          select: {
            id: true,
            username: true,
            profileImage: true,
          },
        },
      },
    },
    _count: {
      select: {
        likes: true,
        replies: true,
        reposts: true,
      },
    },
    ...(userId && {
      likes: {
        where: { userId },
        select: { userId: true },
      },
      bookmarks: {
        where: { userId },
        select: { userId: true },
      },
    }),
  }),
);

// Optimize fetchPosts with better caching and fewer transformations
export async function fetchPosts({
  view,
  cursor,
  limit = 10,
  userId,
  username,
  excludeReplies = false,
}: {
  view: PostViewType;
  cursor?: string;
  limit?: number;
  userId?: string | null;
  username?: string;
  excludeReplies?: boolean;
}): Promise<PaginatedResponse<PostWithContext>> {
  const cacheKey = `posts-${view}-${userId}-${username}-${cursor}`;

  return unstable_cache(
    async () => {
      const where = {
        AND: [
          username ? { author: { username } } : {},
          excludeReplies || view === 'all' ? { parentId: null } : {},
          view === 'following' && userId
            ? {
                author: { followers: { some: { followerId: userId } } },
              }
            : {},
        ],
      };

      const posts = await prisma.post.findMany({
        where,
        take: limit + 1,
        ...(cursor && { skip: 1, cursor: { id: cursor } }),
        include: getPostInclude(userId ?? null),
        orderBy:
          view === 'top'
            ? [{ likes: { _count: 'desc' } }, { createdAt: 'desc' }]
            : [{ createdAt: 'desc' }],
      });

      const hasNextPage = posts.length > limit;
      const displayPosts = hasNextPage ? posts.slice(0, -1) : posts;

      return {
        data: (displayPosts as unknown as PrismaPost[]).map((post) => {
          return {
            id: post.id,
            text: post.text,
            createdAt: post.createdAt,
            updatedAt: post.createdAt,
            authorId: post.author.id,
            author: {
              id: post.author.id,
              username: post.author.username,
              profileImage: post.author.profileImage,
              fullName: post.author.fullName,
              verified: post.author.verified,
              isFollowing: userId ? post.author.followers.length > 0 : false,
            },
            images: post.images,
            count: {
              likeCount: post._count.likes,
              replyCount: post._count.replies,
              repostCount: post._count.reposts,
            },
            replies: (post.replies ?? []).map((reply) => ({
              id: reply.id,
              text: reply.text,
              createdAt: reply.createdAt,
              updatedAt: reply.createdAt,
              author: reply.author,
              authorId: reply.author.id,
              _count: { likeCount: 0, replyCount: 0, repostCount: 0 },
              count: { likeCount: 0, replyCount: 0, repostCount: 0 },
              interaction: {
                hasLiked: false,
                hasReposted: false,
                hasBookmarked: false,
              },
              likes: [],
              replies: [],
              reposts: [],
              isLiked: false,
              isBookmarked: { isBookmarkedByUser: false },
              replyPrivacy: 'PUBLIC',
              parentId: post.id,
              quoteId: null,
            })),
            likes: post.likes ?? [],
            reposts: post.reposts ?? [],
            isLiked: userId ? (post.likes ?? []).length > 0 : false,
            isBookmarked: {
              isBookmarkedByUser: userId
                ? (post.bookmarks ?? []).length > 0
                : false,
            },
            replyPrivacy: post.replyPrivacy,
            parentId: post.parentId,
            quoteId: post.quoteId,
            view,
          };
        }) as unknown as PostWithContext[],
        nextCursor: hasNextPage
          ? (displayPosts[displayPosts.length - 1]?.id ?? null)
          : null,
        hasNextPage,
      };
    },
    [cacheKey],
    {
      revalidate: 30,
      tags: [
        'posts',
        ...(userId ? [`user-${userId}`] : []),
        ...(username ? [`user-${username}`] : []),
      ],
    },
  )();
}
