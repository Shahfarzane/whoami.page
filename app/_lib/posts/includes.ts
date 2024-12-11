import { Prisma } from '@prisma/client';

export const getPostInclude = (userId: string | null): Prisma.PostInclude => ({
  author: {
    include: {
      followers: true,
    },
  },
  likes: true,
  bookmarks: true,
  _count: {
    select: {
      likes: true,
      replies: true,
      reposts: true,
    },
  },
});
