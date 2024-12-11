import { AuthorInfo, Interaction, BookmarkInfo } from './index';
import type { Post } from './posts';
import { ReplyPrivacy } from '@prisma/client';

export interface ReplyButtonProps {
  id: string;
  count: number;
  replyPrivacy: ReplyPrivacy;
  isFollowing: boolean;
  threadInfo: {
    id: string;
    author: AuthorInfo;
    text: string;
    createdAt: Date;
    likes: Interaction[];
    isBookmarked: BookmarkInfo;
    replies: any[];
    images: string[];
    reposts: any[];
    bookmarks: any[];
    quoteId: string | null;
    parentId: string | null;
    replyPrivacy: ReplyPrivacy;
  };
  onReply: (text: string) => Promise<void>;
  isLoading?: boolean;
}
