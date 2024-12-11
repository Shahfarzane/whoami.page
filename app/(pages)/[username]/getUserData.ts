// app/(pages)/[username]/getUserData.ts

import { getSingleUser } from '@/app/_services/user';

type UserDataError = {
  code: string;
  message: string;
};

export async function getUserData(username: string) {
  try {
    const user = await getSingleUser(username);
    if (!user) return null;

    return {
      ...user,
      authorId: user.id,
      _count: {
        followers: user._count?.followers ?? 0,
        following: user._count?.following ?? 0,
        posts: user._count?.posts ?? 0,
      },
      projects: user.projects.map((project) => ({
        ...project,
        description: project.description ?? null,
      })),
      contactMethods: user.contactMethods.map((cm) => ({
        ...cm,
        createdAt: new Date(),
        updatedAt: new Date(),
        authorId: user.id,
      })),
    };
  } catch (error) {
    if (process.env.NODE_ENV === 'production') {
      // Log to error tracking service
    }
    return null;
  }
}
