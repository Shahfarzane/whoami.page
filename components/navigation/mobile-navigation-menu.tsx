'use client';

import React from 'react';
import { useClerk } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { DropdownMenu } from '@radix-ui/themes';
import { HamburgerMenuIcon } from '@radix-ui/react-icons';

export default function MobileNavigationMenu() {
  const router = useRouter();
  const { signOut } = useClerk();

  return (
    <>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger>
          <div>
            <HamburgerMenuIcon
              width="32"
              height="32"
              className="transform cursor-pointer text-secondary transition-all duration-150 ease-out hover:scale-100 hover:text-foreground active:scale-90 active:text-foreground"
            />
          </div>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content
          variant="soft"
          align="end"
          className="z-[999] mt-1 rounded-2xl bg-background p-0 shadow-xl"
        >
          <DropdownMenu.Item className="active:bg-primary-foreground cursor-pointer select-none rounded-none px-4 py-3 text-sm font-semibold tracking-normal focus:bg-transparent">
            About
          </DropdownMenu.Item>
          <DropdownMenu.Separator className="my-0 h-[1.2px]" />

          <DropdownMenu.Item className="active:bg-primary-foreground cursor-pointer select-none rounded-none px-4 py-3 text-sm font-semibold tracking-normal focus:bg-transparent">
            <div
              aria-label="Log out"
              onClick={() => signOut(() => router.push('/'))}
            >
              Log out
            </div>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    </>
  );
}
