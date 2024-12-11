// app/[username]/page.tsx
import { notFound } from 'next/navigation';
import { Flex } from '@radix-ui/themes';
import { UserWithRelations } from '@/types/user';
import UserProfileCard from '@/components/user/user-profile-card';
import { getUserData } from './getUserData';
import { auth } from '@clerk/nextjs/server';

interface ProfilePageProps {
  params: {
    username: string;
  };
}

export default async function ProfilePage({ params }: ProfilePageProps) {
    const [{ userId }, userData] = await Promise.all([
    auth(),
    getUserData(params.username),
  ]);

  if (!userData) notFound();

  const user: UserWithRelations = {
    ...userData,
    following: userData.following || [],
    followers: userData.followers || [],
    contactMethods: userData.contactMethods || [],
    experiences: userData.experiences || [],
    projects: userData.projects.map((p) => ({
      ...p,
      description: p.description ?? null,
    })),
    _count: userData._count || {
      followers: 0,
      following: 0,
      posts: 0,
    },
  };

  return (
    <Flex direction="column" gap="4">
      <UserProfileCard
        user={user}
        edit={user.id === userId}
        currentUserId={userId || null}
      />
    </Flex>
  );
}
