'use client';

import * as React from 'react';
import { useUser, useClerk } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button, Avatar, Skeleton, DropdownMenu } from '@radix-ui/themes';
import { ArrowRightIcon, EnterIcon } from '@radix-ui/react-icons';
import { useSettingsModal } from '@/providers/settings-modal-provider';
import SettingsDialog from '@/components/settings/settings-dialog';
import { useQuery } from '@tanstack/react-query';
import { getCurrentAuthUser } from '@/app/_services/user';

const UserButtonAndMenu = React.forwardRef<HTMLButtonElement, {}>(
  (props, ref) => {
    const { user } = useUser();
    const { signOut } = useClerk();
    const router = useRouter();
    const label = user?.username?.slice(0, 2).toUpperCase() ?? 'Profile';
    const [dropdownOpen, setDropdownOpen] = React.useState(false);
    const { openModal, closeModal, isOpen } = useSettingsModal();

    const { data: userData } = useQuery({
      queryKey: ['userData', user?.id],
      queryFn: getCurrentAuthUser,
      enabled: !!user?.id,
    });

    const handleOpenSettings = (e: React.MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault();
      openModal();
      setDropdownOpen(false);
    };

    const handleSignOut = (e: React.MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault();
      signOut();
      router.push('/');
    };

    return (
      <>
        <DropdownMenu.Root open={dropdownOpen} onOpenChange={setDropdownOpen}>
          <DropdownMenu.Trigger className="h-8 w-8">
            {user?.hasImage ? (
              <Avatar
                size="2"
                radius="full"
                src={user.imageUrl}
                alt={label}
                fallback={label}
                className="h-8 w-8"
              />
            ) : (
              <Avatar
                fallback={label}
                size="2"
                radius="full"
                src={user?.imageUrl || '/default-avatar.png'}
                alt={label}
                className="h-8 w-8"
              />
            )}
          </DropdownMenu.Trigger>
          <DropdownMenu.Content variant="soft" size="2" className="w-full">
            <div className="w-[260px]">
              <DropdownMenu.Item asChild className="w-full">
                <Link
                  href={`/${user?.username ?? ''}`}
                  className="py-2 text-sm"
                >
                  {user?.hasImage ? (
                    <Avatar
                      mx="1"
                      size="2"
                      radius="full"
                      src={user.imageUrl}
                      alt={label}
                      fallback={label}
                    />
                  ) : (
                    <Avatar
                      fallback={label}
                      size="2"
                      radius="full"
                      src={user?.imageUrl || 'default-avatar.png'}
                      alt={label}
                    />
                  )}
                  {user?.username ?? 'U'}
                </Link>
              </DropdownMenu.Item>
              <DropdownMenu.Separator />
              <DropdownMenu.Group>
                <DropdownMenu.Item asChild>
                  <Link
                    href="#"
                    onClick={handleOpenSettings}
                    className="py-2 text-sm"
                  >
                    Manage Your Account
                  </Link>
                </DropdownMenu.Item>
                <DropdownMenu.Item asChild>
                  <Link
                    href="#"
                    onClick={handleSignOut}
                    className="py-2 text-sm"
                  >
                    Log out
                  </Link>
                </DropdownMenu.Item>
              </DropdownMenu.Group>
            </div>
          </DropdownMenu.Content>
        </DropdownMenu.Root>
        <SettingsDialog user={userData!} edit={true} />
      </>
    );
  },
);
UserButtonAndMenu.displayName = 'UserButtonAndMenu';

export const UserButton = React.forwardRef<HTMLButtonElement, {}>(
  (props, ref) => {
    const { isLoaded, user } = useUser();
    const { openSignIn } = useClerk();

    return (
      <div className="flex h-8 w-8 items-center justify-center">
        {!isLoaded ? (
          <Skeleton className="h-8 w-8 rounded-full">
            <EnterIcon className="h-8 w-8 animate-spin rounded-full" />
          </Skeleton>
        ) : !user?.id ? (
          <Button
            ref={ref}
            radius="full"
            onClick={() => openSignIn()}
            className="flex h-8 w-8 items-center justify-center rounded-full p-0"
          >
            <ArrowRightIcon className="h-6 w-6" />
          </Button>
        ) : (
          <UserButtonAndMenu ref={ref} />
        )}
      </div>
    );
  },
);

UserButton.displayName = 'UserButton';
