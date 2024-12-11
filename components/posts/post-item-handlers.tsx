'use client';

import React, { memo } from 'react';
import PostItem from '@/components/posts/post-item';
import { usePostInteractions } from '@/hooks/usePostInteractions';
import { PostViewType, PostItemProps } from '@/types/posts';
import { Post } from '@/types';

interface PostItemHandlersProps {
  post: Omit<PostItemProps, 'onLike' | 'onReply'> & { view: PostViewType };
  handlers?: {
    onLike: () => Promise<void>;
    onReply: (text: string) => Promise<void>;
  };
  isThread?: boolean;
  onReplySuccess?: (reply: Post) => void;
}

export default memo(
  function PostItemHandlers({
    post,
    handlers,
    onReplySuccess,
  }: PostItemHandlersProps) {
    const { handleLike, handleRepost, handleBookmark, handleReply, isLoading } =
      usePostInteractions(post.id);

    // Combine handlers with defaults
    const finalHandlers = {
      onLike: handlers?.onLike ?? handleLike,
      onReply: handlers?.onReply ?? handleReply,
      onRepost: handleRepost,
      onBookmark: handleBookmark,
    };

    return (
      <PostItem
        post={{
          ...post,
          interaction: {
            hasLiked: post.isLiked,
            hasReposted: false,
            hasBookmarked: post.isBookmarked.isBookmarkedByUser,
          },
        }}
        {...finalHandlers}
        isLoading={
          isLoading.like ||
          isLoading.reply ||
          isLoading.repost ||
          isLoading.bookmark
        }
      />
    );
  },
  (prevProps, nextProps) => {
    const shouldUpdate =
      prevProps.post.id !== nextProps.post.id ||
      prevProps.post.isLiked !== nextProps.post.isLiked ||
      prevProps.post.view !== nextProps.post.view;

    return !shouldUpdate;
  },
);
