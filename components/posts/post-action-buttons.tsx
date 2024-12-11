import React from 'react';
import { Post } from '@/types';
import LikeButton from '@/components/buttons/like-button';
import ReplyButton from '@/components/buttons/reply-button';
import RepostButton from '@/components/buttons/repost-button';
import BookmarkButton from '@/components/buttons/bookmark-button';
import ShareButton from '@/components/buttons/share-button';
import { Grid, Flex } from '@radix-ui/themes';
import { usePostInteractions } from '@/hooks/usePostInteractions';

interface PostActionButtonsProps {
  post: Post;
  isLoading: boolean;
}

export function PostActionButtons({ post, isLoading }: PostActionButtonsProps) {
  const { handleLike, handleReply, handleRepost, handleBookmark } =
    usePostInteractions(post.id);

  const commonProps = {
    id: post.id,
  };

  return (
    <Grid columns="5" gap="3" width="100%">
      <Flex align="center" justify="center">
        <LikeButton
          {...commonProps}
          isLiked={post.isLiked}
          likeCount={post.count.likeCount}
          onLike={handleLike}
        />
      </Flex>
      <Flex align="center" justify="center">
        <ReplyButton
          {...commonProps}
          count={post.count.replyCount}
          replyPrivacy={post.replyPrivacy}
          isFollowing={post.author.isFollowing}
          threadInfo={{
            ...post,
            bookmarks: [],
          }}
          onReply={handleReply}
          isLoading={isLoading}
        />
      </Flex>
      <Flex align="center" justify="center">
        <RepostButton
          {...commonProps}
          text={post.text}
          author={post.author}
          createdAt={post.createdAt}
          isRepostedByMe={post.interaction.hasReposted}
          onRepost={handleRepost}
        />
      </Flex>
      <Flex align="center" justify="center">
        <BookmarkButton
          {...commonProps}
          isBookmarked={post.isBookmarked.isBookmarkedByUser}
          onBookmark={handleBookmark}
        />
      </Flex>
      <Flex align="center" justify="center">
        <ShareButton author={post.author.username} id={post.id} />
      </Flex>
    </Grid>
  );
}
