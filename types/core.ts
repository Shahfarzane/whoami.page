import type { BasePost, Post, PostWithContext } from './posts';

export interface BaseUser {
  id: string;
  username: string;
  email: string;
  profileImage: string | null;
  fullName: string | null;
  verified: boolean | null;
  createdAt: Date;
  updatedAt: Date;
  authorId: string;
}

export interface AuthorInfo {
  id: string;
  username: string;
  profileImage: string | null;
  fullName: string | null;
  verified: boolean | null;
  isFollowing: boolean;
}

export interface InteractionCounts {
  likeCount: number;
  replyCount: number;
  repostCount: number;
}

export interface Interaction {
  userId: string;
  postId: string;
  createdAt: Date;
}

// Bookmark Types
export interface BookmarkInfo {
  isBookmarkedByUser: boolean;
}

// Optimistic Updates
export interface OptimisticState {
  like: boolean;
  repost: boolean;
  bookmark: boolean;
}

export interface FetchResult<T = unknown> {
  data: T[];
  nextCursor: string | null;
  hasNextPage: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  nextCursor: string | null;
  hasNextPage: boolean;
}

// Component Props Types
export interface PostComponentProps extends Post {
  onLike: () => Promise<void>;
  onReply: (text: string) => Promise<void>;
  onRepost?: () => Promise<void>;
  onBookmark?: () => Promise<void>;
  isReply?: boolean;
  isThread?: boolean;
  className?: string;
}

// Add ViewType here since it's a core type
export type ViewType =
  | 'all'
  | 'bookmarked'
  | 'user'
  | 'feed'
  | 'thread'
  | 'replies'
  | 'quote'
  | 'search'
  | 'single'
  | 'following'
  | 'top'
  | 'bookmarks'
  | 'profile';

export interface FollowerUser {
  id: string;
  username: string;
  fullName: string | null;
  profileImage: string | null;
  isFollowing?: boolean;
  _count?: {
    followers: number;
    following: number;
  };
}

export type { BasePost, Post, PostWithContext };
