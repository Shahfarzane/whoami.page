'use client';

import React from 'react';
import { useParams, usePathname } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { getUserProfile } from '@/app/_actions/user';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Box } from '@radix-ui/themes';
import { UserWithRelations } from '@/types/user';
import UserProfileCard from '@/components/user/user-profile-card';
import ProfileSection from '@/components/user/profile';
import SettingsDialog from '@/components/settings/settings-dialog';

interface UserLayoutContentProps {
  initialUser: UserWithRelations;
  edit: boolean;
  currentUserId: string | null;
  children: React.ReactNode;
}

const UserNav = React.memo(
  ({ username, pathname }: { username: string; pathname: string }) => {
    const isActiveTab = (path: string) => {
      if (path === `/${username}`) return pathname === `/${username}`;
      return pathname.startsWith(`/${username}/posts`);
    };

    return (
      <nav className="flex w-full border-b" aria-label="User Profile Tabs">
        <Link
          href={`/${username}`}
          className={cn(
            'font-regular flex h-12 w-full items-center justify-center text-center text-gray-4 duration-200',
            {
              'border-b-2 border-neutral-500 text-foreground': isActiveTab(
                `/${username}`,
              ),
            },
          )}
        >
          Profile
        </Link>
        <Link
          href={`/${username}/posts`}
          className={cn(
            'font-regular flex h-12 w-full items-center justify-center text-center text-gray-4 duration-200',
            {
              'border-b-2 border-neutral-500 text-foreground': isActiveTab(
                `/${username}/posts`,
              ),
            },
          )}
        >
          Posts
        </Link>
      </nav>
    );
  },
);

UserNav.displayName = 'UserNav';

export default function UserLayoutContent({
  initialUser,
  edit,
  currentUserId,
  children,
}: UserLayoutContentProps) {
  const pathname = usePathname();
  const { username } = useParams();

  const { data: user } = useQuery({
    queryKey: ['user', initialUser.id],
    queryFn: () => getUserProfile(initialUser.id),
    initialData: initialUser,
    staleTime: 1000 * 60 * 5,
    refetchOnMount: false,
    refetchOnWindowFocus: true,
  });

  const isProfileView = pathname === `/${username}`;

  return (
    <Box width="full" className="pb-16" minHeight="calc(100vh - 64px)">
      <UserProfileCard user={user} edit={edit} currentUserId={currentUserId} />
      <UserNav username={username as string} pathname={pathname} />
      {isProfileView ? (
        <ProfileSection
          user={user}
          edit={edit}
          experience={user.experiences}
          projects={user.projects}
          contactMethods={user.contactMethods}
        />
      ) : (
        children
      )}
      {currentUserId && edit && <SettingsDialog user={user} edit={edit} />}
    </Box>
  );
}
