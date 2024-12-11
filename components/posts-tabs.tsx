'use client';

import { useCallback, useState, useEffect } from 'react';
import { Tabs } from '@radix-ui/themes';
import { PostViewType } from '@/types/posts';
import { useQueryClient } from '@tanstack/react-query';
import { fetchPosts } from '@/app/_actions/posts';

interface PostsTabsProps {
  currentView: PostViewType;
  onViewChange: (view: PostViewType) => void;
  currentUserId: string | null;
}

export default function PostsTabs({
  currentView,
  onViewChange,
  currentUserId,
}: PostsTabsProps) {
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const [activeView, setActiveView] = useState(currentView);

  // Sync with prop changes
  useEffect(() => {
    setActiveView(currentView);
  }, [currentView]);

  const handleTabChange = useCallback(
    async (view: PostViewType) => {
      if (view === activeView) return;

      setIsLoading(true);
      try {
        // Update local state first
        setActiveView(view);

        // Then trigger the view change
        onViewChange(view);

        // Prefetch new data
        await queryClient.prefetchInfiniteQuery({
          queryKey: ['posts', view, currentUserId],
          queryFn: ({ pageParam }) =>
            fetchPosts({
              view,
              cursor: pageParam as string | undefined,
              limit: 10,
              userId: currentUserId,
            }),
          initialPageParam: null as string | null,
        });
      } finally {
        setIsLoading(false);
      }
    },
    [queryClient, onViewChange, activeView, currentUserId],
  );

  return (
    <Tabs.Root
      value={activeView}
      onValueChange={(value) => void handleTabChange(value as PostViewType)}
    >
      <Tabs.List justify="center">
        <Tabs.Trigger value="all" disabled={isLoading}>
          All
        </Tabs.Trigger>
        <Tabs.Trigger value="top" disabled={isLoading}>
          Top
        </Tabs.Trigger>
        {currentUserId && (
          <Tabs.Trigger value="following" disabled={isLoading}>
            Following
          </Tabs.Trigger>
        )}
      </Tabs.List>
    </Tabs.Root>
  );
}
