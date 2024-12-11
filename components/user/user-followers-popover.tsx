import React from 'react';
import { Button, Flex, Skeleton, Text, Popover } from '@radix-ui/themes';
import { getFollowersData } from '@/app/_actions/user';
import { useQuery } from '@tanstack/react-query';
import UserList from '@/components/user/user-list';

interface UserFollowersPopoverProps {
  userId: string;
  followerCount: number;
  followingCount: number;
  currentUserId: string | null;
}

const LoadingSkeleton = () => (
  <div className="w-[300px]">
    {Array.from({ length: 5 }).map((_, i) => (
      <Flex key={i} align="center" justify="between" py="2">
        <Flex align="center" gap="2">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Flex direction="column">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-4 w-20" />
          </Flex>
        </Flex>
        <Skeleton className="h-8 w-20" />
      </Flex>
    ))}
  </div>
);

const CountButton = React.forwardRef<
  HTMLDivElement,
  { count: number; label: string }
>(({ count, label }, ref) => (
  <div ref={ref}>
    <Text
      weight="medium"
      size="2"
      highContrast
      className="cursor-pointer hover:underline"
    >
      {count.toLocaleString()} <Text color="gray">{label}</Text>
    </Text>
  </div>
));

CountButton.displayName = 'CountButton';

const FollowerList = React.memo<{
  userId: string;
  type: 'followers' | 'following';
  currentUserId: string | null;
}>(({ userId, type, currentUserId }) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['followersData', userId, type, currentUserId],
    queryFn: async () => {
      const data = await getFollowersData(userId, currentUserId);

      const transformedUsers =
        type === 'followers'
          ? data.followers.map((f) => ({
              id: f.follower.id,
              username: f.follower.username,
              fullName: f.follower.fullName,
              profileImage: f.follower.profileImage,
              isFollowing: false,
              _count: {
                followers: 0,
                following: 0,
              },
            }))
          : data.following.map((f) => ({
              id: f.following.id,
              username: f.following.username,
              fullName: f.following.fullName,
              profileImage: f.following.profileImage,
              isFollowing: false,
              _count: {
                followers: 0,
                following: 0,
              },
            }));

      return { users: transformedUsers };
    },
    staleTime: 1000 * 60 * 5,
  });

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <UserList
      users={data?.users ?? []}
      currentUserId={currentUserId}
      error={error instanceof Error ? error : null}
    />
  );
});

FollowerList.displayName = 'FollowerList';

const PopoverWrapper = React.memo<{
  count: number;
  label: string;
  type: 'followers' | 'following';
  userId: string;
  currentUserId: string | null;
}>(({ count, label, type, userId, currentUserId }) => (
  <Flex gap="4" align="center">
    <Popover.Root>
      <Popover.Trigger>
        <Button variant="ghost" size="1">
          {count} {label}
        </Button>
      </Popover.Trigger>
      <Popover.Content size="1" maxWidth="360px">
        <FollowerList
          userId={userId}
          type={type}
          currentUserId={currentUserId}
        />
      </Popover.Content>
    </Popover.Root>
  </Flex>
));

PopoverWrapper.displayName = 'PopoverWrapper';

const UserFollowersPopover = React.memo<UserFollowersPopoverProps>(
  ({ userId, followerCount, followingCount, currentUserId }) => {
    const followerLabel = React.useMemo(
      () => (followerCount === 1 ? 'follower' : 'followers'),
      [followerCount],
    );

    return (
      <Flex gap="4">
        <PopoverWrapper
          count={followerCount}
          label={followerLabel}
          type="followers"
          userId={userId}
          currentUserId={currentUserId}
        />
        <PopoverWrapper
          count={followingCount}
          label="following"
          type="following"
          userId={userId}
          currentUserId={currentUserId}
        />
      </Flex>
    );
  },
);

UserFollowersPopover.displayName = 'UserFollowersPopover';

export default UserFollowersPopover;
