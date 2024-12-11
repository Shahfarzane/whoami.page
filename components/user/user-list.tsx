import { FollowerUser } from '@/types/core';
import { ScrollArea, Flex, Text, Avatar, Link } from '@radix-ui/themes';
import { Box } from '@radix-ui/themes';
import { useVirtualizer } from '@tanstack/react-virtual';
import React from 'react';

const UserList = React.memo(
  ({
    users,
    currentUserId,
    error,
  }: {
    users: FollowerUser[];
    currentUserId: string | null;
    error?: Error | null;
  }) => {
    const parentRef = React.useRef<HTMLDivElement>(null);

    const rowVirtualizer = useVirtualizer({
      count: users?.length ?? 0,
      getScrollElement: () => parentRef.current,
      estimateSize: () => 60,
      overscan: 5,
    });
    if (error) {
      return (
        <Box width="360px">
          <Text>Failed to load users</Text>
        </Box>
      );
    }

    return (
      <Box width="360px">
        <ScrollArea style={{ height: '350px' }}>
          <Box ref={parentRef}>
            <div
              style={{
                height: `${rowVirtualizer.getTotalSize()}px`,
                width: '100%',
                position: 'relative',
              }}
            >
              {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                const user = users[virtualRow.index];
                if (!user) return null;

                return (
                  <div
                    key={user.id}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: `${virtualRow.size}px`,
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                  >
                    <Flex align="center" justify="between" py="2">
                      <Flex align="center" gap="2" width="100%">
                        <Avatar
                          radius="full"
                          src={user.profileImage || undefined}
                          fallback={user.username[0]?.toUpperCase() ?? ''}
                          size="2"
                        />
                        <Flex direction="column" width="full" gap="1">
                          <Link href={`/${user.username}`}>
                            <Text size="2">{user.username}</Text>
                          </Link>
                        </Flex>
                      </Flex>
                    </Flex>
                  </div>
                );
              })}
            </div>
          </Box>
        </ScrollArea>
      </Box>
    );
  },
);
UserList.displayName = 'UserList';

export default UserList;
