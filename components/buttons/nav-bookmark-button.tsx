'use client';

import { Button } from '@radix-ui/themes';
import { BookmarkIcon } from '@radix-ui/react-icons';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { useAuthStore } from '@/store/auth';

export default function NavBookmarkButton() {
  const router = useRouter();
  const { isSignedIn } = useUser();
  const openSignInModal = useAuthStore((state) => state.openSignInModal);

  const handleClick = () => {
    if (!isSignedIn) {
      openSignInModal();
      return;
    }
    router.push(`/bookmarks`);
  };

  return (
    <Button
      highContrast
      variant="ghost"
      onClick={handleClick}
      className="flex items-center justify-center md:h-8 md:w-8"
    >
      <BookmarkIcon className="text-muted-foreground hover:text-accent-foreground h-7 w-7" />
      <span className="sr-only">View Bookmarks</span>
    </Button>
  );
}
