'use client';

import React, { memo, useRef, useCallback } from 'react';
import type { Prisma } from '@prisma/client';
import { Button, Tooltip, Flex, Badge, Text } from '@radix-ui/themes';
import { ExternalLink } from '@/components/ui/link';
import UserAvatar from './user-avatar';
import { useUserActions } from '@/context/user-actions-context';
import FollowButton from '@/components/buttons/follow-button';
import UserFollowersPopover from '@/components/user/user-followers-popover';
import { Icons } from '@/components/ui/icons';
import { useSettingsModal } from '@/providers/settings-modal-provider';

type UserWithRelations = Prisma.UserGetPayload<{
  include: {
    contactMethods: true;
    projects: true;
    experiences: true;
    followers: true;
    following: true;
    _count: { select: { followers: true; following: true; posts: true } };
  };
}>;

interface UserProfileCardProps {
  user: UserWithRelations;
  edit: boolean;
  currentUserId: string | null;
}

const UserInfo = memo(function UserInfo({
  fullName,
  verified,
  jobTitle,
  location,
  website,
  username,
}: {
  fullName: string | null;
  verified: boolean | null;
  jobTitle: string | null;
  location: string | null;
  website: string | null;
  username: string;
}) {
  return (
    <div className="min-h-[80px] w-full flex-1">
      <Flex className="items-center gap-1">
        <Text size="4" weight="medium" truncate>
          {fullName || username}
        </Text>
        {verified && (
          <Tooltip content="Verified user">
            <span className="ml-1">
              <Icons.verified className="h-4 w-4" />
            </span>
          </Tooltip>
        )}
      </Flex>
      <Text color="gray" size="2" truncate>
        {jobTitle && location
          ? `${jobTitle} in ${location}`
          : jobTitle || location || ''}
      </Text>
      {website && (
        <Flex className="mt-1">
          <Tooltip content={`${username}'s website`}>
            <Badge variant="soft" radius="full" size="2">
              <ExternalLink href={website} externalIcon={true}>
                {new URL(website).hostname}
              </ExternalLink>
            </Badge>
          </Tooltip>
        </Flex>
      )}
    </div>
  );
});

const UserProfileCard = memo(function UserProfileCard({
  user,
  edit,
  currentUserId,
}: UserProfileCardProps) {
  const { openModal } = useSettingsModal();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { handleFileChange, isImageUploading, profileImage } = useUserActions();

  const onAvatarClick = useCallback(() => {
    if (edit && fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, [edit]);

  const displayedImage = React.useMemo(
    () => profileImage || user.profileImage || '/default-avatar.png',
    [profileImage, user.profileImage],
  );

  // Preload image with higher priority
  React.useEffect(() => {
    const preloadImage = new Image();
    preloadImage.src = displayedImage;
    preloadImage.fetchPriority = 'high';
  }, [displayedImage]);

  const followerCount = user._count?.followers ?? 0;
  const followingCount = user._count?.following ?? 0;

  return (
    <Flex>
      <Flex className="w-full" direction="column" gap="4" p="5">
        <Flex className="w-full items-start justify-between">
          <UserInfo
            fullName={user.fullName}
            verified={user.verified}
            jobTitle={user.jobTitle}
            location={user.location}
            website={user.website}
            username={user.username}
          />
          <div className="shrink-0">
            <UserAvatar
              displayedImage={displayedImage}
              username={user.username}
              edit={edit}
              isImageUploading={isImageUploading}
              onAvatarClick={onAvatarClick}
              size="md"
            />
          </div>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
          />
        </Flex>

        <Flex className="w-full" gap="8">
          {edit ? (
            <Button
              size="1"
              radius="large"
              highContrast
              className="border border-strong hover:border-stronger hover:bg-selection"
              variant="soft"
              color="gray"
              onClick={openModal}
            >
              Edit Profile
            </Button>
          ) : (
            <FollowButton
              profileUser={{
                id: user.id,
                username: user.username,
                fullName: user.fullName,
                profileImage: user.profileImage,
              }}
              currentUserId={currentUserId}
            />
          )}
        </Flex>

        <UserFollowersPopover
          userId={user.id}
          followerCount={followerCount}
          followingCount={followingCount}
          currentUserId={currentUserId}
        />
      </Flex>
    </Flex>
  );
});

export default UserProfileCard;
