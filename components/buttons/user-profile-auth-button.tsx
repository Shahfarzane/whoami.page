'use client';

import { useUser } from '@clerk/nextjs';
import { Button } from '@radix-ui/themes';
import { usePathname } from 'next/navigation';
import { Icons } from '@/components/ui/icons';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/auth';

interface UserProfileAuthNavButtonProps {
  onSignedInClick?: () => void;
  className?: string;
}

export function UserProfileAuthNavButton({
  onSignedInClick,
  className,
}: UserProfileAuthNavButtonProps) {
  const { isSignedIn, isLoaded, user } = useUser();
  const pathname = usePathname();
  const openSignInModal = useAuthStore((state) => state.openSignInModal);

  // if (!isLoaded) return null;

  const isProfilePage = user?.username
    ? pathname === `/${user.username}`
    : false;
  const iconClass =
    'text-muted-foreground hover:text-accent-foreground h-7 w-7';

  const handleClick = () => {
    if (isSignedIn && onSignedInClick) {
      onSignedInClick();
    } else if (!isSignedIn) {
      openSignInModal();
    }
  };

  return (
    <div className="flex h-9 w-9 items-center justify-center">
      <Button
        color="gray"
        highContrast
        variant="ghost"
        onClick={handleClick}
        aria-label={isSignedIn ? 'View profile' : 'Sign in'}
      >
        <Icons.newProfileIcon
          className={cn(iconClass, className)}
          stroke="red"
          fill={isProfilePage ? 'currentColor' : 'transparent'}
        />
      </Button>
    </div>
  );
}
