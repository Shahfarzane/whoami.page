'use client';

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useMemo,
} from 'react';
import { BasePost, FetchResult, PostViewType } from '@/types/posts';

interface PostsContextType {
  currentView: PostViewType;
  setCurrentView: (view: PostViewType) => void;
  showHeaderTabs: boolean;
  setShowHeaderTabs: (show: boolean) => void;
}

const PostsContext = createContext<PostsContextType | undefined>(undefined);

interface PostsProviderProps {
  children: ReactNode;
  initialData: FetchResult<BasePost>;
  initialView: PostViewType;
  initialShowHeaderTabs: boolean;
}

export const PostsProvider: React.FC<PostsProviderProps> = ({
  children,
  initialView,
  initialShowHeaderTabs,
}) => {
  const [currentView, setCurrentView] = useState<PostViewType>(initialView);
  const [showHeaderTabs, setShowHeaderTabs] = useState(initialShowHeaderTabs);

  const value = useMemo(
    () => ({
      currentView,
      setCurrentView,
      showHeaderTabs,
      setShowHeaderTabs,
    }),
    [currentView, showHeaderTabs],
  );

  return (
    <PostsContext.Provider value={value}>{children}</PostsContext.Provider>
  );
};

export const usePostsContext = () => {
  const context = useContext(PostsContext);
  if (context === undefined) {
    throw new Error('usePostsContext must be used within a PostsProvider');
  }
  return context;
};
