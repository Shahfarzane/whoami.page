import { BookmarkedPosts } from './BookmarkedPosts';
import { Flex, Box, Text } from '@radix-ui/themes';
import { getBookmarks } from '@/app/_actions/posts';
import { auth } from '@clerk/nextjs/server';

export default async function BookmarksPage() {
  const { userId } = await auth();

  if (!userId) {
    return (
      <Flex direction="column" style={containerStyle}>
        <Box p="4" style={{ borderBottom: '1px solid var(--gray-4)' }}>
          <Text weight="medium" size="3">
            Bookmarked Posts
          </Text>
        </Box>
        <Flex
          direction="column"
          align="center"
          justify="center"
          gap="4"
          style={{ minHeight: '50vh' }}
        >
          <Text size="4" weight="medium">
            Sign in to view your bookmarks
          </Text>
          <Text size="3" color="gray">
            You can still browse and view posts without signing in.
          </Text>
        </Flex>
      </Flex>
    );
  }

  try {
    const initialData = await getBookmarks({
      cursor: null,
      userId,
    });

    return (
      <Flex direction="column" style={containerStyle}>
        <Box p="4" style={{ borderBottom: '1px solid var(--gray-4)' }}>
          <Text weight="medium" size="3">
            Bookmarked Posts
          </Text>
        </Box>
        <BookmarkedPosts initialData={initialData} userId={userId} />
      </Flex>
    );
  } catch (error) {
    return (
      <Flex direction="column" style={containerStyle}>
        <Box p="4" style={{ borderBottom: '1px solid var(--gray-4)' }}>
          <Text weight="medium" size="3">
            Bookmarked Posts
          </Text>
        </Box>
        <Flex
          direction="column"
          align="center"
          justify="center"
          gap="4"
          style={{ minHeight: '50vh' }}
        >
          <Text size="4" weight="medium" color="red">
            Error loading bookmarks
          </Text>
          <Text size="3" color="gray">
            Please try again later
          </Text>
        </Flex>
      </Flex>
    );
  }
}

const containerStyle = {
  borderLeft: '1px solid var(--gray-4)',
  borderRight: '1px solid var(--gray-4)',
  minHeight: '100vh',
  paddingBottom: '60px',
};
