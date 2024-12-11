'use client';

import { formatTimeAgo } from '@/lib/utils';
import { Text } from '@radix-ui/themes';

interface PostDateProps {
  date: Date;
}

export default function PostDate({ date }: PostDateProps) {
  return (
    <Text size="1" color="gray">
      {formatTimeAgo(date)}
    </Text>
  );
}
