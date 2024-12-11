'use server';
import { auth } from '@clerk/nextjs/server';
import db from '@/app/_lib/db';

export async function getCurrentAuthUser() {
  try {
    const session = await auth();
    if (!session.userId) return null;

    const user = await db.user.findUnique({
      where: { id: session.userId },
      include: {
        experiences: true,
        projects: true,
        contactMethods: true,
        followers: true,
        following: true,
        _count: {
          select: {
            followers: true,
            following: true,
            posts: true,
          },
        },
      },
    });

    return user;
  } catch (error) {
    return null;
  }
}

export async function getSingleUser(usernameOrId: string) {
  const user = await db.user.findFirst({
    where: {
      OR: [
        { id: usernameOrId },
        { username: { equals: usernameOrId, mode: 'insensitive' } },
      ],
    },
    include: {
      contactMethods: true,
      projects: true,
      experiences: true,
      followers: true,
      following: true,
      _count: {
        select: {
          followers: true,
          following: true,
          posts: true,
        },
      },
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  return user;
}

export async function getUsernames() {
  const users = await db.user.findMany({
    select: { username: true },
  });
  return users.map((user) => user.username);
}

export async function getUserPosts() {
  const posts = await db.post.findMany({
    select: {
      id: true,
      author: {
        select: {
          username: true,
        },
      },
      updatedAt: true,
    },
  });

  return posts.map((post) => ({
    id: post.id,
    username: post.author.username,
    updatedAt: post.updatedAt,
  }));
}
