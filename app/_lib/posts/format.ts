import { Prisma } from '@prisma/client';

type PostWithIncludes = Prisma.PostGetPayload<{
  include: {
    author: {
      include: {
        followers: true;
      };
    };
    likes: true;
    bookmarks: true;
    _count: {
      select: {
        likes: true;
        replies: true;
        reposts: true;
      };
    };
    replies?: {
      include: {
        author: {
          include: {
            followers: true;
          };
        };
        likes: true;
        bookmarks: true;
        _count: {
          select: {
            likes: true;
            replies: true;
            reposts: true;
          };
        };
      };
    };
  };
}>;

export const formatPost = (post: any, userId: string | null) => ({
  ...post,
  author: {
    ...post.author,
    followers: post.author.followers || [],
    isFollowing: userId
      ? post.author.followers?.some((f: any) => f.followerId === userId)
      : false,
  },
  count: {
    likeCount: post._count?.likes || 0,
    replyCount: post._count?.replies || 0,
    repostCount: post._count?.reposts || 0,
  },
  interaction: {
    hasLiked: Boolean(userId && post.likes?.length),
    hasBookmarked: Boolean(userId && post.bookmarks?.length),
    hasReposted: false,
  },
  isLiked: Boolean(userId && post.likes?.length),
  isBookmarked: {
    isBookmarkedByUser: Boolean(userId && post.bookmarks?.length),
  },
  replies:
    post.replies?.map((reply: PostWithIncludes) => formatPost(reply, userId)) ||
    [],
  reposts: [],
  view: 'all',
  _count: {
    likes: post._count?.likes || 0,
    replies: post._count?.replies || 0,
    reposts: post._count?.reposts || 0,
    likeCount: post._count?.likes || 0,
    replyCount: post._count?.replies || 0,
    repostCount: post._count?.reposts || 0,
  },
});
