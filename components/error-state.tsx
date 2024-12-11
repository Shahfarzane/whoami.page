import { Box, Text } from '@radix-ui/themes';

export default function ErrorState() {
  return (
    <Box className="p-4 text-center">
      <Text color="red">Something went wrong. Please try again later.</Text>
    </Box>
  );
}
