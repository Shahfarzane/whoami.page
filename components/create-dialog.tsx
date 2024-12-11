'use client';

import React, { forwardRef } from 'react';
import { Box, Dialog } from '@radix-ui/themes';
import useDialog from '@/store/dialog';
import PostController from './post-controller';
import type { PostProps } from '@/types/posts';
import { useUser } from '@clerk/nextjs';
import { useQueryClient } from '@tanstack/react-query';

interface DialogProps {
  variant?: 'button' | 'inline';
}

const CreateDialog = forwardRef<HTMLButtonElement, DialogProps>(
  ({ variant = 'button' }, ref) => {
    const { openDialog, setOpenDialog, resetDialogState, replyPostInfo } =
      useDialog();
    const { isSignedIn } = useUser();
    const queryClient = useQueryClient();

    const handleSuccess = async (newPost: PostProps) => {
      if (replyPostInfo?.onReply) {
        await replyPostInfo.onReply(newPost.post.text);
      }
      setOpenDialog(false);
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    };

    const handleClose = () => {
      setOpenDialog(false);
      resetDialogState();
    };

    if (variant === 'inline') {
      return isSignedIn ? (
        <Box px="4">
          <PostController onSuccess={handleSuccess} onClose={handleClose} />
        </Box>
      ) : null;
    }

    return (
      <>
        {isSignedIn && (
          <Dialog.Root open={openDialog} onOpenChange={handleClose}>
            <Dialog.Content
              size="2"
              className="fixed left-[50%] top-[50%] z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4 border bg-background p-6 shadow-lg duration-200 sm:rounded-lg"
            >
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <Dialog.Title className="text-lg font-semibold">
                    {replyPostInfo ? 'Reply' : 'New Thread'}
                  </Dialog.Title>
                  <Dialog.Close className="rounded-full opacity-70 transition-opacity hover:opacity-100">
                    <span className="sr-only">Close</span>
                  </Dialog.Close>
                </div>
                <PostController
                  isReply={!!replyPostInfo}
                  isDialog={true}
                  onSuccess={handleSuccess}
                  onClose={handleClose}
                  postId={replyPostInfo?.id}
                  replyPrivacySetting={replyPostInfo?.replyPrivacy}
                  isFollowing={replyPostInfo?.isFollowing}
                  formId={`dialog-${replyPostInfo?.id || 'new'}`}
                />
              </div>
            </Dialog.Content>
          </Dialog.Root>
        )}
      </>
    );
  },
);

CreateDialog.displayName = 'CreateDialog';

export default CreateDialog;
