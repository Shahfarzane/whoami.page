'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { PostsProvider } from '@/context/posts-context';
import { PostsView, PostViewType, Post as PostType } from '@/types/posts';
import { PaginatedResponse } from '@/types';
import { useQueryClient } from '@tanstack/react-query';
import { fetchPosts } from '@/app/_actions/posts';

interface PostsProviderWrapperProps {
  initialView: PostsView;
  initialShowHeaderTabs: boolean;
  children: React.ReactNode;
  initialPosts?: PaginatedResponse<PostType>;
}

export function PostsProviderWrapper({
  children,
  initialView,
  initialShowHeaderTabs = true,
  initialPosts,
}: PostsProviderWrapperProps) {
  const queryClient = useQueryClient();
  const [view] = useState(initialView);
  const [showHeaderTabs] = useState(initialShowHeaderTabs);

  const prefetchPosts = useCallback(() => {
    queryClient.prefetchInfiniteQuery({
      queryKey: ['posts', view.view],
      queryFn: () =>
        fetchPosts({
          view: view.view as PostViewType,
          cursor: undefined,
          limit: 10,
        }),
      initialPageParam: null,
    });
  }, [view.view, queryClient]);

  useEffect(() => {
    const timer = setTimeout(prefetchPosts, 1000);
    return () => clearTimeout(timer);
  }, [prefetchPosts]);

  const providerValue = useMemo(
    () => ({
      initialData: initialPosts ?? {
        data: [],
        nextCursor: null,
        hasNextPage: false,
      },
      initialView: view.view as PostViewType,
      initialShowHeaderTabs: showHeaderTabs,
    }),
    [view.view, showHeaderTabs, initialPosts],
  );

  return <PostsProvider {...providerValue}>{children}</PostsProvider>;
}

export { PostsProviderWrapper as default } from './posts-provider';
