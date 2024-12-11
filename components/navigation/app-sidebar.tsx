import { SignedIn } from '@clerk/nextjs';
import { Icons } from '@/components/ui/icons';
import { UserButton } from '@/components/buttons/user-button';
import { BackButton } from '../buttons/back-button';
import { SidebarNavItem } from './sidebar-nav-item';
import OptimizedSearch from '@/components/search/search-trigger';
import CreateButton from '@/components/buttons/create-button';
import NavBookmarkButton from '@/components/buttons/nav-bookmark-button';
import { UserProfileAuthNavButton } from '@/components/buttons/user-profile-auth-button';

interface AppSidebarProps {
  onBack: () => void;
  showBack: boolean;
  isCurrentPath: (path: string) => boolean;
  handleProfileClick: () => void;
  isSignedIn: boolean;
}

export function AppSidebar({
  onBack,
  showBack,
  isCurrentPath,
  handleProfileClick,
  isSignedIn,
}: AppSidebarProps) {
  return (
    <aside className="fixed inset-y-0 left-0 z-50 hidden h-full w-[60px] flex-col items-center justify-between border-r border-border sm:flex">
      <nav className="flex h-[60px] w-full flex-col items-center justify-center px-2">
        <BackButton onBack={onBack} show={showBack} />
      </nav>

      <nav className="flex h-full w-full flex-col items-center justify-center gap-6 px-2 py-4">
        <SidebarNavItem
          icon={
            isCurrentPath('/') ? (
              <Icons.homeIconFilled className="text-accent-foreground h-7 w-7" />
            ) : (
              <Icons.homeIconLine className="text-muted-foreground hover:text-accent-foreground h-7 w-7" />
            )
          }
          href="/"
          label="Home"
        />

        <SidebarNavItem
          icon={
            <UserProfileAuthNavButton onSignedInClick={handleProfileClick} />
          }
          label={isSignedIn ? 'Profile' : 'Sign In'}
        />

        <SidebarNavItem icon={<OptimizedSearch />} label="Search" />
        <SidebarNavItem icon={<NavBookmarkButton />} label="Bookmarks" />
        <SidebarNavItem icon={<CreateButton />} label="Create" />
      </nav>

      <nav className="flex h-[60px] w-full flex-col items-center justify-center px-2">
        <SignedIn>
          <SidebarNavItem icon={<UserButton />} label="Profile" />
        </SignedIn>
      </nav>
    </aside>
  );
}
