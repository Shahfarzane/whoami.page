'use client';

import React, { useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createPost } from '@/app/_actions/posts';
import useDialog from '@/store/dialog';
import { PostComposerForm } from '@/components/posts/post-composer-form';
import { useUser } from '@clerk/nextjs';
import { ReplyPrivacy } from '@prisma/client';
import { PostProps } from '@/types/posts';
import { toast } from 'sonner';
import { debounce } from 'lodash';
import ErrorBoundary from '@/components/error-boundary';
import ErrorState from '@/components/error-state';

interface PostControllerProps {
  onSuccess?: (newPost: PostProps) => void;
  onClose?: () => void;
  isReply?: boolean;
  isDialog?: boolean;
  postId?: string;
  replyPrivacySetting?: ReplyPrivacy;
  isFollowing?: boolean;
  formId?: string;
  initialReplyText?: string;
}

const debouncedUploadCheck = debounce(async () => {
  try {
    await fetch('/api/uploadthing', { method: 'GET' });
  } catch (error) {}
}, 1000);

export default function PostController({
  onSuccess,
  onClose,
  isReply,
  isDialog,
  postId,
  replyPrivacySetting,
  isFollowing,
  formId = 'main',
  initialReplyText,
}: PostControllerProps) {
  const queryClient = useQueryClient();
  const { setOpenDialog } = useDialog();
  const { user } = useUser();

  const mutation = useMutation({
    mutationFn: createPost,
    onMutate: async (formData: FormData) => {
      await Promise.all([
        queryClient.cancelQueries({ queryKey: ['posts'] }),
        queryClient.cancelQueries({ queryKey: ['replies'] }),
      ]);

      // Create optimistic post
      const optimisticPost = {
        id: 'temp-' + Date.now(),
        text: formData.get('text') as string,
        images: Array.from(formData.getAll('images')).map((img) =>
          img.toString(),
        ),
        createdAt: new Date().toISOString(),
        author: {
          id: user?.id,
          username: user?.username,
          profileImage: user?.imageUrl,
          fullName: user?.fullName,
          verified: false,
          isFollowing: false,
        },
        _count: {
          likeCount: 0,
          replyCount: 0,
          repostCount: 0,
        },
        count: {
          likeCount: 0,
          replyCount: 0,
          repostCount: 0,
        },
        isBookmarked: {
          isBookmarkedByUser: false,
        },
        isLiked: false,
        parentId: postId || null,
        view: 'all',
        currentUserId: user?.id,
      };

      // Get the previous posts
      const previousPosts = queryClient.getQueryData(['posts']) as any;

      // Optimistically update the posts list
      queryClient.setQueryData(['posts'], (old: any) => {
        if (!old?.pages?.[0]) return old;
        return {
          ...old,
          pages: [
            {
              ...old.pages[0],
              data: [optimisticPost, ...old.pages[0].data],
            },
            ...old.pages.slice(1),
          ],
        };
      });

      return { previousPosts, optimisticPost };
    },
    onError: (err, variables, context) => {
      if (context?.previousPosts) {
        queryClient.setQueryData(['posts'], context.previousPosts);
      }
      toast.error('Failed to create post');
    },
    onSuccess: (newPost) => {
      if (!user?.id) return;

      // First, transform and pass the new post to parent
      const postProps: PostProps = {
        post: newPost,
        isReply: false,
        isDialog: false,
      };
      onSuccess?.(postProps);

      // Then close dialogs and show success message
      setOpenDialog(false);
      onClose?.();

      // Finally, invalidate and refetch queries
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.refetchQueries({ queryKey: ['posts'] });
    },
  });

  const handleSubmit = useCallback(
    async (formData: FormData) => {
      if (postId) {
        formData.append('parentId', postId);
      }
      debouncedUploadCheck();
      await mutation.mutateAsync(formData);
    },
    [postId, mutation, debouncedUploadCheck],
  );

  if (!user) return null;

  return (
    <ErrorBoundary fallback={<ErrorState />}>
      <PostComposerForm
        onSubmit={handleSubmit}
        showPrivacySettings
        isSubmitting={mutation.isPending}
        showAvatar={true}
        user={{
          profileImage: user.imageUrl,
          username: user.username ?? '',
        }}
        formId={isDialog ? `dialog-${postId || 'new'}` : formId}
        initialText={initialReplyText}
      />
    </ErrorBoundary>
  );
}
