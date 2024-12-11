'use server';

import { auth } from '@clerk/nextjs/server';
import db from '@/app/_lib/db';
import { Prisma } from '@prisma/client';
import { FilterType, SearchCursor, SearchResult } from '@/types/search';

const ITEMS_PER_PAGE = 20;

export async function searchAll(
  query: string,
  filter: FilterType,
  cursor?: SearchCursor | null,
): Promise<SearchResult> {
  const { userId } = await auth();

  if (!query) {
    return {
      users: [],
      posts: [],
      projects: [],
      experiences: [],
      nextCursor: {
        all: null,
        users: null,
        posts: null,
        projects: null,
        experiences: null,
      },
    };
  }

  try {
    const searchTerm = {
      contains: query.slice(0, 50),
      mode: 'insensitive' as Prisma.QueryMode,
    };

    // Update posts query to exclude replies by default
    const postsQuery =
      filter === 'all' || filter === 'posts'
        ? db.post.findMany({
            where: {
              AND: [
                { text: searchTerm },
                { parentId: null }, // Exclude replies
              ],
            },
            take: ITEMS_PER_PAGE + 1,
            cursor: cursor?.posts ? { id: cursor.posts } : undefined,
            orderBy: { createdAt: 'desc' },
            include: {
              author: {
                select: {
                  id: true,
                  username: true,
                  profileImage: true,
                  fullName: true,
                  verified: true,
                },
              },
              _count: {
                select: {
                  likes: true,
                  replies: true,
                  reposts: true,
                },
              },
              likes: true,
              reposts: true,
              replies: true,
              bookmarks: {
                where: userId ? { userId } : undefined,
              },
            },
          })
        : Promise.resolve([]);

    // Parallel queries with type safety
    const [users, posts, projects, experiences] = await Promise.all([
      filter === 'all' || filter === 'users'
        ? db.user.findMany({
            where: {
              OR: [
                { username: searchTerm },
                { fullName: searchTerm },
                { description: searchTerm },
              ],
            },
            take: ITEMS_PER_PAGE + 1,
            cursor: cursor?.users ? { id: cursor.users } : undefined,
            orderBy: { createdAt: 'desc' },
          })
        : Promise.resolve([]),

      postsQuery,

      filter === 'all' || filter === 'projects'
        ? db.projects.findMany({
            where: {
              OR: [
                { title: searchTerm },
                { description: searchTerm },
                { client: searchTerm },
              ],
            },
            take: ITEMS_PER_PAGE + 1,
            cursor: cursor?.projects ? { id: cursor.projects } : undefined,
            orderBy: { createdAt: 'desc' },
          })
        : Promise.resolve([]),

      filter === 'all' || filter === 'experiences'
        ? db.userExperience.findMany({
            where: {
              OR: [
                { title: searchTerm },
                { company: searchTerm },
                { description: searchTerm },
              ],
            },
            take: ITEMS_PER_PAGE + 1,
            cursor: cursor?.experiences
              ? { id: cursor.experiences }
              : undefined,
            orderBy: { createdAt: 'desc' },
          })
        : Promise.resolve([]),
    ]);

    // Safe cursor calculation with type checking
    const getNextCursor = <T extends { id: string }>(
      items: T[],
    ): string | null => {
      return items.length > ITEMS_PER_PAGE
        ? (items[ITEMS_PER_PAGE - 1]?.id ?? null)
        : null;
    };

    // Process results and set up next cursors
    const nextCursor: SearchCursor = {
      all: null,
      users: getNextCursor(users),
      posts: getNextCursor(posts),
      projects: getNextCursor(projects),
      experiences: getNextCursor(experiences),
    };

    // Format posts with all required fields
    const formattedPosts = posts.slice(0, ITEMS_PER_PAGE).map((post) => ({
      ...post,
      author: {
        ...post.author,
        isFollowing: false,
      },
      count: {
        likeCount: post._count.likes,
        replyCount: post._count.replies,
        repostCount: post._count.reposts,
      },
      _count: {
        likeCount: post._count.likes,
        replyCount: post._count.replies,
        repostCount: post._count.reposts,
      },
      isLiked: post.likes.some((like) => like.userId === userId),
      isBookmarked: {
        isBookmarkedByUser: post.bookmarks.length > 0,
      },
      interaction: {
        hasLiked: post.likes.some((like) => like.userId === userId),
        hasReposted: post.reposts.some((repost) => repost.userId === userId),
        hasBookmarked: post.bookmarks.length > 0,
      },
      replies: post.replies.map((reply) => ({
        ...reply,
        author: {
          ...post.author,
          isFollowing: false,
        },
        _count: { likeCount: 0, replyCount: 0, repostCount: 0 },
        count: { likeCount: 0, replyCount: 0, repostCount: 0 },
        likes: [],
        replies: [],
        reposts: [],
        isLiked: false,
        isBookmarked: { isBookmarkedByUser: false },
        interaction: {
          hasLiked: false,
          hasReposted: false,
          hasBookmarked: false,
        },
      })),
    }));

    // Format users with isFollowing field
    const formattedUsers = users.slice(0, ITEMS_PER_PAGE).map((user) => ({
      ...user,
      isFollowing: false, // You might want to fetch this from a follows table
    }));

    // Format projects to handle null/undefined
    const formattedProjects = projects.map((project) => ({
      ...project,
      description: project.description ?? null,
      client: project.client ?? null,
    }));

    return {
      users: formattedUsers,
      posts: formattedPosts,
      projects: formattedProjects,
      experiences: experiences.slice(0, ITEMS_PER_PAGE),
      nextCursor,
    };
  } catch (error) {
    throw new Error('Search failed');
  }
}
