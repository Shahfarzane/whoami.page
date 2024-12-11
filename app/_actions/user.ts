'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { auth, clerkClient, currentUser } from '@clerk/nextjs/server';
import db from '@/app/_lib/db';
import { z } from 'zod';
import { ContactMethod, ContactUrlType } from '@prisma/client';
import { contactMethodSchema } from '@/app/_lib/schema';
import { getUserEmail } from '@/lib/utils';
import type { Prisma } from '@prisma/client';

type UserWithRelations = Prisma.UserGetPayload<{
  include: {
    contactMethods: true;
    projects: true;
    experiences: true;
    followers: true;
    following: true;
    _count: {
      select: {
        followers: true;
        following: true;
        posts: true;
      };
    };
  };
}>;

// Helper function for API responses
const createApiResponse = async <T>(action: () => Promise<T>) => {
  try {
    const result = await action();
    return result;
  } catch (error) {
    throw error;
  }
};

// Profile updates
const profileSchema = z.object({
  username: z.string().min(3).max(30).optional(),
  fullName: z.string().min(1).optional(),
  jobTitle: z.string().optional(),
  website: z.string().url().optional(),
  location: z.string().optional(),
  description: z.string().max(500).optional(),
});

export async function updateProfile(formData: FormData) {
  return createApiResponse(async () => {
    const { userId } = await auth();
    if (!userId) throw new Error('Not authenticated');

    const data = Object.fromEntries(formData.entries());
    const validatedData = profileSchema.parse(data);

    const updatedUser = await db.user.update({
      where: { id: userId },
      data: validatedData,
    });

    revalidateTag('user-data');
    revalidatePath(`/${updatedUser.username}`);
    return updatedUser;
  });
}

export const createContactMethod = async (data: {
  type: ContactUrlType;
  contactUsername: string;
}): Promise<ContactMethod> => {
  const session = await auth();
  if (!session.userId) {
    throw new Error('User not authenticated');
  }

  const parsedData = contactMethodSchema.parse(data);

  const newContactMethod = await db.contactMethod.create({
    data: {
      ...parsedData,
      userId: session.userId,
    },
  });

  revalidateTag('user-data');
  return newContactMethod;
};

export const updateContactMethod = async (data: {
  id: string;
  type: ContactUrlType;
  contactUsername: string;
}): Promise<ContactMethod> => {
  const { userId } = await auth();
  if (!userId) {
    throw new Error('User not authenticated');
  }

  const parsedData = contactMethodSchema.parse(data);

  const contactMethod = await db.contactMethod.findUnique({
    where: { id: data.id },
  });

  if (!contactMethod || contactMethod.userId !== userId) {
    throw new Error('Contact method not found or user not authorized');
  }

  const updatedContactMethod = await db.contactMethod.update({
    where: { id: data.id },
    data: parsedData,
  });

  revalidateTag('user-data');
  return updatedContactMethod;
};

export async function deleteContact(formData: FormData) {
  return createApiResponse(async () => {
    const { userId } = await auth();
    if (!userId) throw new Error('Not authenticated');

    const id = formData.get('id') as string;
    if (!id) throw new Error('Contact ID is required');

    await db.contactMethod.delete({
      where: { id, userId },
    });

    revalidateTag('user-data');
    revalidatePath(`/${userId}`);
    return { success: true };
  });
}

// Username generation and onboarding
export async function generateUsername() {
  const user = await currentUser();
  if (!user) throw new Error('User not found');

  const email = user.emailAddresses[0]?.emailAddress;
  if (!email) throw new Error('Email not found');

  const baseUsername = email.split('@')[0]?.replace(/[^a-zA-Z0-9]/g, '') ?? '';
  let username = baseUsername;
  let suffix = 1;

  while (await db.user.findUnique({ where: { username } })) {
    username = `${baseUsername}${suffix.toString().padStart(2, '0')}`;
    suffix++;
    if (suffix > 99) throw new Error('Unable to generate unique username');
  }

  return username;
}

export async function setupAccount({
  userId,
  username,
  fullName,
}: {
  userId: string;
  username: string;
  fullName: string;
}) {
  const user = await (await clerkClient()).users.getUser(userId);
  if (!user) throw new Error('User not authenticated');

  const email = getUserEmail(user);
  const existingUser = await db.user.findUnique({ where: { email } });
  if (existingUser) throw new Error('User already exists');

  try {
    await (
      await clerkClient()
    ).users.updateUser(userId, {
      username: username.toLowerCase(),
    });
  } catch (error: any) {
    if (
      error.clerkError &&
      error.errors.some((e: any) => e.code === 'form_identifier_exists')
    ) {
      throw new Error('That username is taken. Please try another.');
    }
    throw new Error('Error updating Clerk user');
  }

  return db.$transaction(async (prisma) => {
    const createdUser = await prisma.user.create({
      data: {
        id: user.id,
        email,
        firstName: user.firstName ?? '',
        lastName: user.lastName ?? '',
        profileImage: user.imageUrl,
        username: username.toLowerCase(),
        fullName,
        onboardingComplete: false,
        emailVerified: true,
      },
    });

    return createdUser;
  });
}

export async function completeOnboarding(
  userId: string,
  username: string,
  fullName: string,
): Promise<{ message: string }> {
  if (!userId) return { message: 'No Logged In User' };

  try {
    await (
      await clerkClient()
    ).users.updateUser(userId, {
      username: username.toLowerCase(),
      publicMetadata: { onboardingComplete: true, fullName },
    });

    await db.user.update({
      where: { id: userId },
      data: {
        username: username.toLowerCase(),
        fullName,
        onboardingComplete: true,
      },
    });

    return { message: 'User metadata Updated' };
  } catch (error: any) {
    if (
      error.clerkError &&
      error.errors.some((e: any) => e.code === 'form_identifier_exists')
    ) {
      return { message: 'That username is taken. Please try another.' };
    }
    return { message: 'Error updating user metadata' };
  }
}

export async function getUserProfile(
  userId: string,
): Promise<UserWithRelations> {
  return createApiResponse(async () => {
    const user = await db.user.findUnique({
      where: { id: userId },
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
  });
}

export async function toggleFollow(userId: string) {
  return createApiResponse(async () => {
    const { userId: currentUserId } = await auth();
    if (!currentUserId) throw new Error('Not authenticated');

    const existingFollow = await db.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: currentUserId,
          followingId: userId,
        },
      },
    });

    if (existingFollow) {
      await db.follow.delete({
        where: { id: existingFollow.id },
      });
    } else {
      await db.follow.create({
        data: {
          followerId: currentUserId,
          followingId: userId,
        },
      });
    }

    revalidatePath('/[username]');
    return { success: true };
  });
}

export async function getFollowersData(
  userId: string,
  currentUserId: string | null,
) {
  return createApiResponse(async () => {
    const followers = await db.follow.findMany({
      where: { followingId: userId },
      include: {
        follower: true,
      },
    });

    const following = await db.follow.findMany({
      where: { followerId: userId },
      include: {
        following: true,
      },
    });

    return { followers, following };
  });
}

export async function updateUserImage(formData: FormData) {
  return createApiResponse(async () => {
    const { userId } = await auth();
    if (!userId) throw new Error('Not authenticated');

    const file = formData.get('file');
    if (!file) throw new Error('No file provided');

    const user = await db.user.update({
      where: { id: userId },
      data: {
        profileImage: 'imageUrl',
      },
    });

    revalidatePath('/[username]');
    return user;
  });
}

export async function batchCheckFollowStatus(
  userIds: string[],
  currentUserId: string | null,
) {
  return createApiResponse(async () => {
    if (!currentUserId || userIds.length === 0) {
      return {};
    }

    const follows = await db.follow.findMany({
      where: {
        followerId: currentUserId,
        followingId: {
          in: userIds,
        },
      },
      select: {
        followingId: true,
      },
    });

    const followStatus: Record<string, boolean> = {};
    userIds.forEach((userId) => {
      followStatus[userId] = follows.some(
        (follow) => follow.followingId === userId,
      );
    });

    return followStatus;
  });
}
