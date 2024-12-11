'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Icons } from '@/components/ui/icons';
import { cn } from '@/lib/utils';
import CreatePostCard from '@/components/posts/post-reply-dialog';
import { useUser } from '@clerk/nextjs';
import { UserButton } from '@/components/buttons/user-button';
import SearchTrigger from '@/components/search/search-trigger';
import { UserProfileAuthNavButton } from '@/components/buttons/user-profile-auth-button';

export default function NavigationMenu() {
  const path = usePathname();
  const { user, isSignedIn } = useUser();
  const router = useRouter();
  const handleProfileClick = () => {
    if (isSignedIn && user) {
      router.push(`/${user.username}`);
    }
  };

  return (
    <div className="flex w-full items-center justify-between px-4">
      <div className="flex h-9 w-9 items-center justify-center transition-colors hover:text-foreground">
        <Link href="/">
          <Icons.home
            className={cn(
              'h-7 w-7',
              path === '/' ? 'text-accent-foreground' : '',
            )}
            stroke="red"
            fill={path === '/' ? 'currentColor' : ''}
          />
        </Link>
        <span className="sr-only">Home</span>
      </div>

      <div className="flex h-9 w-9 cursor-pointer items-center justify-center transition-colors hover:text-foreground">
        <UserProfileAuthNavButton onSignedInClick={handleProfileClick} />

        <span className="sr-only">Profile/Sign In</span>
      </div>
      <SearchTrigger />
      <CreatePostCard />

      {isSignedIn && (
        <div className="text-muted-foreground flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:text-foreground">
          <UserButton />
          <span className="sr-only">User Profile</span>
        </div>
      )}
    </div>
  );
}
