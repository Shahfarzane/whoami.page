import React from 'react';
import useDialog from '@/store/dialog';
import { ReplyButtonProps } from '@/types/buttons';
import { useUser } from '@clerk/nextjs';
import { ChatBubbleIcon } from '@radix-ui/react-icons';
import { ReplyPrivacy } from '@prisma/client';
import BaseIconButton from '@/components/buttons/base-icon-button';
import { useAuthStore } from '@/store/auth';
import { InteractionCounts } from '@/types/core';

const DEFAULT_INTERACTION_COUNTS: InteractionCounts = {
  likeCount: 0,
  replyCount: 0,
  repostCount: 0,
};

const ReplyButton: React.FC<ReplyButtonProps> = ({
  id,
  count,
  onReply,
  replyPrivacy,
  isFollowing,
  threadInfo,
}) => {
  const { setOpenDialog, setReplyPostInfo, resetDialogState } = useDialog();
  const { user: loggedUser } = useUser();
  const openSignInModal = useAuthStore((state) => state.openSignInModal);

  const isReplyDisabled =
    replyPrivacy === ReplyPrivacy.FOLLOWERS_ONLY && !isFollowing;

  const handleReply = () => {
    if (!loggedUser) {
      openSignInModal();
      return;
    }

    const replyInfo = {
      ...threadInfo,
      id,
      onReply,
      parentId: id,
      isFollowing,
      count: DEFAULT_INTERACTION_COUNTS,
      interaction: {
        hasLiked: false,
        hasReposted: false,
        hasBookmarked: false,
      },
    };

    setReplyPostInfo(replyInfo);
    setOpenDialog(true);
  };

  const getTooltipContent = () => {
    if (!loggedUser) return 'Sign in to reply';
    if (replyPrivacy === ReplyPrivacy.FOLLOWERS_ONLY && !isFollowing) {
      return 'You must follow the author to reply to this post';
    }
    return 'Reply to this post';
  };
  return (
    <BaseIconButton
      ariaLabel="Reply to this post"
      icon={<ChatBubbleIcon height={16} width={16} />}
      count={count}
      onClick={handleReply}
      color="gray"
      disabled={isReplyDisabled}
      tooltipContent={getTooltipContent()}
    />
  );
};

export default ReplyButton;
