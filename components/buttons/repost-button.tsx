import React, { useState, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import { DropdownMenu } from '@radix-ui/themes';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useOptimisticRepost } from '@/hooks/useOptimisticRepost';
import BaseIconButton from '@/components/buttons/base-icon-button';
import { useAuthStore } from '@/store/auth';
import { Icons } from '@/components/ui/icons';
import { cn } from '@/lib/utils';
import { AuthorInfo } from '@/types';
import QuoteButton from '@/components/buttons/quote-button';

interface RepostButtonProps {
  id: string;
  text: string;
  author: AuthorInfo;
  isRepostedByMe: boolean;
  createdAt: Date;
  onRepost: (isReposted: boolean) => void;
}

const RepostButton: React.FC<RepostButtonProps> = React.memo(
  ({ id, text, author, createdAt, isRepostedByMe, onRepost }) => {
    const { user: loggedUser } = useUser();
    const openSignInModal = useAuthStore((state) => state.openSignInModal);
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);

    const { optimisticIsReposted, repostMutation } = useOptimisticRepost(
      id,
      isRepostedByMe,
    );

    const handleRepost = useCallback(() => {
      if (!loggedUser) {
        openSignInModal();
        return;
      }
      repostMutation.mutate(undefined, {
        onSuccess: () => {
          onRepost(!optimisticIsReposted);
          toast.success(
            optimisticIsReposted ? 'Repost removed' : 'Post reposted',
          );
          router.refresh();
        },
        onError: () => {
          toast.error('Failed to repost. Please try again.');
        },
      });
      setIsOpen(false);
    }, [
      loggedUser,
      openSignInModal,
      repostMutation,
      optimisticIsReposted,
      onRepost,
      router,
    ]);

    return (
      <DropdownMenu.Root open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenu.Trigger>
          <BaseIconButton
            icon={
              optimisticIsReposted ? (
                <Icons.reposted className="h-4 w-4 text-green-400" />
              ) : (
                <Icons.repost className="h-4 w-4" />
              )
            }
            disabled={repostMutation.isPending}
            color={optimisticIsReposted ? 'green' : 'gray'}
            tooltipContent={loggedUser ? 'Repost options' : 'Sign in to repost'}
            onClick={() => !loggedUser && openSignInModal()}
            ariaLabel="Repost options"
          />
        </DropdownMenu.Trigger>
        <DropdownMenu.Content
          align="start"
          className="w-[190px] rounded-2xl bg-background p-0 shadow-xl dark:bg-[#181818]"
        >
          <DropdownMenu.Item
            disabled={repostMutation.isPending}
            onClick={handleRepost}
            className={cn(
              'active:bg-primary-foreground w-full cursor-pointer select-none justify-between rounded-none px-4 py-3 text-sm font-semibold tracking-normal focus:bg-transparent',
              {
                'text-red-600 focus:text-red-600': optimisticIsReposted,
              },
            )}
          >
            {optimisticIsReposted ? 'Remove Repost' : 'Repost'}
            <Icons.repost
              className={cn('h-5 w-5', {
                'text-red-600': optimisticIsReposted,
              })}
            />
          </DropdownMenu.Item>
          <DropdownMenu.Separator className="my-0 h-[1.2px]" />
          <QuoteButton
            quoteInfo={{
              text,
              id,
              author,
              createdAt,
            }}
          />
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    );
  },
);

RepostButton.displayName = 'RepostButton';

export default RepostButton;
