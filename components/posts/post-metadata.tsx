import React from 'react';
import Username from '@/components/user/user-username';
import { Flex } from '@radix-ui/themes';
import PostDate from '@/components/posts/post-date';
import { AuthorInfo } from '@/types/core';
import PostActionMenu from './post-action-menu';

interface PostMetaDataProps {
  author: AuthorInfo;
  createdAt: Date;
  threadId: string;
}

const PostMetaData: React.FC<PostMetaDataProps> = ({
  author,
  createdAt,
  threadId,
}) => {
  return (
    <Flex justify="between" align="baseline" width="100%" mb="2">
      <Username author={author} />
      <Flex gap="3">
        <PostDate date={new Date(createdAt)} />
      </Flex>
      {/* <PostActionMenu authorId={author.id} threadId={threadId} /> */}
    </Flex>
  );
};

export default PostMetaData;
