'use client';

import { Flex, Skeleton } from '@radix-ui/themes';

export default function PostItemSkeleton() {
  return (
    <Flex
      direction="column"
      py="4"
      px="5"
      style={{
        borderBottom: '1px solid var(--gray-4)',
        minHeight: '168px',
        width: '100%',
      }}
    >
      <Flex gap="3" width="100%">
        {/* Avatar skeleton */}
        <Skeleton
          width="40px"
          height="40px"
          style={{ borderRadius: '9999px', flexShrink: 0 }}
        />

        <Flex direction="column" gap="2" style={{ flex: 1, width: '100%' }}>
          {/* Username and date */}
          <Flex gap="2" align="center">
            <Skeleton width="120px" height="20px" />
            <Skeleton width="80px" height="16px" />
          </Flex>

          {/* Post content */}
          <Skeleton width="100%" height="60px" />

          {/* Action buttons */}
          <Flex gap="4" mt="4" justify="between" height="36px">
            {[...Array(4)].map((_, i) => (
              <Skeleton
                key={i}
                width="40px"
                height="32px"
                style={{ borderRadius: '8px', flexShrink: 0 }}
              />
            ))}
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  );
}
