'use client';

import React, { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { Button, DropdownMenu } from '@radix-ui/themes';
import ConfirmationCard from '@/components/confirmation-card';
import { DotsHorizontalIcon } from '@radix-ui/react-icons';

interface PostActionMenuProps {
  threadId: string;
  authorId: string;
  parentId?: string | null;
}

const PostActionMenu: React.FC<PostActionMenuProps> = ({
  authorId,
  threadId,
  parentId,
}) => {
  const { user } = useUser();
  const isLoggedUser = authorId === user?.id;
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  if (!user) {
    return null;
  }

  return (
    <>
      {isLoggedUser && (
        <DropdownMenu.Root>
          <DropdownMenu.Trigger>
            <div className="hover:before:bg-primary relative flex cursor-pointer items-center justify-center">
              <DotsHorizontalIcon className="aspect-square h-4 w-4 flex-1 overflow-hidden object-cover object-center" />
            </div>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content variant="soft" size="2">
            <DropdownMenu.Item asChild>
              <Button
                variant="ghost"
                color="red"
                onClick={() => setIsDialogOpen(true)}
              >
                Delete
              </Button>
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      )}
      {isDialogOpen && (
        <ConfirmationCard
          id={threadId}
          parentId={parentId ?? undefined}
          onClose={() => setIsDialogOpen(false)}
        />
      )}
    </>
  );
};

export default PostActionMenu;
