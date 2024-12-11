import React from 'react';
import Link from 'next/link';
import { Icons } from '@/components/ui/icons';
import { Box, Flex, Text } from '@radix-ui/themes';
import { AuthorInfo } from '@/types/';

const UserUsername: React.FC<{ author: AuthorInfo }> = ({ author }) => {
  return (
    <Link
      href={`/${author.username}`}
      className="transition-colors hover:text-foreground"
    >
      <Flex gap="3" align="center" direction="column">
        <Box className="relative">
          <Text
            as="div"
            size="2"
            weight="medium"
            className="flex items-center hover:underline hover:underline-offset-2"
          >
            {author.verified && (
              <span className="absolute -right-4 -top-0">
                <Icons.verified className="h-3 w-3" />
              </span>
            )}
            {author.fullName}
          </Text>
          <Text
            as="div"
            size="1"
            color="gray"
            className="hover:underline hover:underline-offset-2"
          >
            @{author.username}
          </Text>
        </Box>
      </Flex>
    </Link>
  );
};

export default UserUsername;
