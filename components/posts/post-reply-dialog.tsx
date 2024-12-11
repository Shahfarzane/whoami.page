'use client';

import React, { useEffect, useState, forwardRef } from 'react';
import { Dialog } from '@radix-ui/themes';
import useDialog from '@/store/dialog';
import CreateButton from '@/components/buttons/create-button';
import PostController from '../post-controller';
import { PostProps } from '@/types/posts';
import { useUser } from '@clerk/nextjs';
import { useQueryClient } from '@tanstack/react-query';

const PostReplyDialog = forwardRef<HTMLButtonElement>((props, ref) => {
  const { openDialog, setOpenDialog, resetDialogState, replyPostInfo } =
    useDialog();
  const [initialText, setInitialText] = useState('');
  const { isSignedIn } = useUser();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (openDialog && replyPostInfo) {
      setInitialText('');
    } else {
      setInitialText('');
    }
  }, [openDialog, replyPostInfo]);

  const handleSuccess = (newPost: PostProps) => {
    setOpenDialog(false);

    // Update the posts cache with the new post
    queryClient.setQueryData(['posts'], (oldData: any) => {
      if (!oldData?.pages?.[0]) return oldData;

      const transformedPost = {
        ...newPost.post,
        count: {
          likeCount: 0,
          replyCount: 0,
          repostCount: 0,
        },
        isBookmarked: {
          isBookmarkedByUser: false,
        },
        likes: [],
        reposts: [],
        replies: [],
      };

      return {
        ...oldData,
        pages: [
          {
            ...oldData.pages[0],
            data: [transformedPost, ...oldData.pages[0].data],
          },
          ...oldData.pages.slice(1),
        ],
      };
    });

    // Invalidate queries to ensure data consistency
    queryClient.invalidateQueries({ queryKey: ['posts'] });
  };

  const handleClose = () => {
    setOpenDialog(false);
    resetDialogState();
    setInitialText('');
  };

  return (
    <>
      <CreateButton ref={ref} />
      {isSignedIn && (
        <Dialog.Root open={openDialog} onOpenChange={handleClose}>
          <Dialog.Content
            maxWidth="500px"
            aria-describedby={undefined}
            className="w-full select-none"
          >
            <Dialog.Title as="h3" weight="medium" size="2">
              {replyPostInfo ? 'Reply' : 'New Thread'}
            </Dialog.Title>
            <PostController
              isReply={!!replyPostInfo}
              isDialog={true}
              onSuccess={handleSuccess}
              onClose={handleClose}
              postId={replyPostInfo?.id}
              initialReplyText={initialText}
              replyPrivacySetting={replyPostInfo?.replyPrivacy}
              isFollowing={replyPostInfo?.isFollowing}
            />
          </Dialog.Content>
        </Dialog.Root>
      )}
    </>
  );
});

PostReplyDialog.displayName = 'PostReplyDialog';

export default PostReplyDialog;
