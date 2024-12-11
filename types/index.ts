import { ReplyPrivacy } from '@prisma/client';

export interface Interaction {
  userId: string;
  postId: string;
  createdAt: Date;
}

export interface PostInteraction {
  hasLiked: boolean;
  hasReposted: boolean;
  hasBookmarked: boolean;
}

export interface AuthorInfo {
  id: string;
  username: string;
  profileImage: string | null;
  fullName: string | null;
  verified: boolean | null;
  isFollowing: boolean;
}

export interface Post {
  id: string;
  text: string;
  createdAt: Date;
  updatedAt: Date;
  authorId: string;
  parentId: string | null;
  quoteId: string | null;
  author: AuthorInfo;
  images: string[];
  count: InteractionCounts;
  likes: Interaction[];
  replies: Post[];
  reposts: Interaction[];
  isLiked: boolean;
  isBookmarked: {
    isBookmarkedByUser: boolean;
  };
  replyPrivacy: ReplyPrivacy;
  view?: PostViewType;
  interaction: PostInteraction;
  _count: {
    likeCount: number;
    replyCount: number;
    repostCount: number;
  };
}

export type PostViewType =
  | 'all'
  | 'following'
  | 'top'
  | 'single'
  | 'user'
  | 'replies';

export interface PaginatedResponse<T> {
  data: T[];
  nextCursor: string | null;
  hasNextPage: boolean;
}

export type PostWithContext = Post & {
  currentUserId?: string | null;
};

export interface InteractionCounts {
  replyCount: number;
  likeCount: number;
  repostCount: number;
}

export interface PostComponentProps {
  id: string;
  text: string;
  author: AuthorInfo;
  createdAt: Date;
  images?: string[];
}

export interface BookmarkInfo {
  isBookmarkedByUser: boolean;
}
