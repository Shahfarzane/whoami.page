import { ReplyPrivacy } from '@prisma/client';
import type { InteractionCounts, AuthorInfo } from './core';
import type { PostViewType, PostInteraction } from './index';

// Base Post Type
export interface BasePost {
  id: string;
  text: string;
  createdAt: Date;
  updatedAt: Date;
  authorId: string;
  parentId: string | null;
  quoteId: string | null;
  replyPrivacy: ReplyPrivacy;
  author: AuthorInfo;
  _count: InteractionCounts;
  count: InteractionCounts;
  images: string[];
  likes: any[];
  replies: BasePost[];
  reposts: any[];
  isLiked: boolean;
  isBookmarked: { isBookmarkedByUser: boolean };
  interaction: PostInteraction;
}

// Post adds view type
export interface Post extends BasePost {
  view?: PostViewType;
}

// PostWithContext adds user context
export interface PostWithContext extends Post {
  currentUserId?: string | null;
}

// PostReply is just an alias for BasePost
export type PostReply = BasePost;

export interface PostActionButtonsProps {
  id: string;
  author: AuthorInfo;
  count: InteractionCounts;
  likes: any[];
  replies: any[];
  reposts: any[];
  isLiked: boolean;
  isBookmarked: { isBookmarkedByUser: boolean };
  onLike: () => Promise<void>;
  onRepost?: () => Promise<void>;
  onBookmark?: () => Promise<void>;
  onReply: (text: string) => Promise<void>;
  isLoading?: {
    like?: boolean;
    reply?: boolean;
    repost?: boolean;
    bookmark?: boolean;
  };
  view: PostViewType;
  replyPrivacy: ReplyPrivacy;
  isFollowing?: boolean;
  text: string;
  createdAt: Date;
}

export interface PostItemProps extends Post {
  view: PostViewType;
  isReply?: boolean;
  isThread?: boolean;
  onLike?: () => Promise<void>;
  onReply?: (text: string) => Promise<void>;
  onRepost?: () => Promise<void>;
  onBookmark?: () => Promise<void>;
  isLoading?: {
    like?: boolean;
    reply?: boolean;
    repost?: boolean;
    bookmark?: boolean;
  };
  onDelete?: () => void;
}

export interface ThreadInfo {
  id: string;
  author: AuthorInfo;
  count: InteractionCounts;
  replyPrivacy: ReplyPrivacy;
  text: string;
  createdAt: Date;
  likes: any[];
  replies: any[];
  images: string[];
  reposts: any[];
  quoteId: string | null;
  parentId: string | null;
  isBookmarked: { isBookmarkedByUser: boolean };
  bookmarks: any[];
  interaction: PostInteraction;
  isFollowing?: boolean;
}

export interface PostProps {
  post: Post;
  parentId?: string;
  isReply?: boolean;
  isDialog?: boolean;
  onSuccess?: (post: PostProps) => void;
  onClose?: () => void;
  initialReplyText?: string;
  replyPrivacySetting?: ReplyPrivacy;
  isFollowing?: boolean;
}

export interface PostsView {
  view: PostViewType;
  username?: string;
  userId?: string;
}

export interface FetchResult<T> {
  data: T[];
  nextCursor: string | null;
  hasNextPage: boolean;
}

export type { PostViewType } from './index';
