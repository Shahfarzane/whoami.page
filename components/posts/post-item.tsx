'use client';

import React, { memo, useCallback, useState, useEffect } from 'react';
import { Avatar, Grid, Box, Flex, Text } from '@radix-ui/themes';
import Link from 'next/link';
import { Post } from '@/types';
import { useRouter } from 'next/navigation';
import Linkify from '@/components/ui/linkify';
import { PostActionButtons } from '@/components/posts/post-action-buttons';
import PostImageGrid from './post-image-grid';
import UserPostRepliesImages from '../user/user-post-replies-images';
import PostMetaData from './post-metadata';
import { ReplyPrivacy } from '@prisma/client';
import PostActionMenu from '@/components/posts/post-action-menu';

interface PostItemProps {
  post: Post;
  isLoading: boolean;
}

const PostAuthorAvatar = memo(function PostAuthorAvatar({
  author,
  hasReplies,
}: {
  author: Post['author'];
  hasReplies: boolean;
}) {
  return (
    <Box>
      <Flex direction="column" align="center" style={{ height: '100%' }}>
        <Link href={`/${author.username}`}>
          <Avatar
            size="3"
            radius="full"
            src={author.profileImage ?? ''}
            alt={author.username}
            fallback={author.username?.slice(0, 2).toUpperCase()}
          />
        </Link>
        {hasReplies && (
          <div
            className="mt-0 flex-grow"
            style={{ width: '1px', backgroundColor: 'var(--gray-6)' }}
          />
        )}
      </Flex>
    </Box>
  );
});

const PostContent = memo(function PostContent({
  post,
  onImageClick,
}: {
  post: Post;
  onImageClick?: (index: number) => void;
}) {
  return (
    <Box my="2">
      <Text size="3">
        <Linkify>{post.text}</Linkify>
      </Text>
      {post.images?.length > 0 && (
        <div>
          <PostImageGrid
            images={post.images}
            authorUsername={post.author.username}
            onImageClick={onImageClick}
            isFirst={post.view === 'single'}
          />
        </div>
      )}
    </Box>
  );
});

export default memo(function PostItem({ post, isLoading }: PostItemProps) {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handlePostClick = useCallback(
    (e: React.MouseEvent) => {
      const target = e.target as HTMLElement;
      const isInteractive =
        target instanceof HTMLAnchorElement ||
        target.closest('a') ||
        target.closest('button') ||
        target.closest('[role="button"]') ||
        target.closest('.post-action-buttons');

      if (isInteractive) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }

      router.push(`/${post.author.username}/posts/${post.id}`);
    },
    [post.author.username, post.id, router],
  );

  const handleImageClick = useCallback(
    (index: number) => {
      if (post.view !== 'single') {
        router.push(`/${post.author.username}/posts/${post.id}`);
      }
    },
    [post.view, post.author.username, post.id, router],
  );

  if (typeof window === 'undefined' || !isMounted) {
    return null;
  }

  return (
    <Flex
      className="group transition-colors duration-200 ease-in-out will-change-auto hover:bg-background md:hover:bg-background"
      direction="column"
      py="4"
      px="5"
      style={{
        borderBottom: '1px solid var(--gray-4)',
        contain: 'content',
      }}
    >
      <Grid columns="auto 1fr auto" gap="3" width="100%">
        <PostAuthorAvatar
          author={post.author}
          hasReplies={post.count.replyCount > 0}
        />

        <Flex
          className="flex-1 cursor-pointer"
          direction="column"
          justify="center"
          minHeight="48px"
          gap="4"
        >
          <Flex direction="column" justify="center" onClick={handlePostClick}>
            <Flex justify="between" align="start" width="100%">
              <PostMetaData
                author={post.author}
                createdAt={post.createdAt}
                threadId={post.id}
              />
            </Flex>
            <PostContent post={post} onImageClick={handleImageClick} />
          </Flex>

          <PostActionButtons post={post} isLoading={isLoading} />
        </Flex>

        <Box className="post-action-menu">
          <PostActionMenu
            threadId={post.id}
            authorId={post.authorId}
            parentId={post.parentId ?? undefined}
          />
        </Box>
      </Grid>

      {post.count.replyCount > 0 && (
        <div className="flex select-none items-center gap-2">
          <div className="flex w-[36px] items-center justify-center">
            <UserPostRepliesImages
              author={post.replies.slice(0, 3).map((reply) => ({
                id: reply.author.id,
                username: reply.author.username,
                image: reply.author.profileImage,
              }))}
            />
          </div>
          <div className="flex items-center text-center text-xs text-[#777777]">
            <Link href={`/${post.author.username}/posts/${post.id}`}>
              <span className="hover:underline">
                {post.count.replyCount}{' '}
                {post.count.replyCount === 1 ? 'reply' : 'replies'}
              </span>
            </Link>
          </div>
        </div>
      )}

      {post.replyPrivacy === ReplyPrivacy.FOLLOWERS_ONLY && (
        <div className="mt-2 text-xs text-gray-500">
          Only followers can reply to this post
        </div>
      )}
    </Flex>
  );
});
