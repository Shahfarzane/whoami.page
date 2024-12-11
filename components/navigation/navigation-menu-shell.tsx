'use client';
import { useCallback, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { Container, Box, Flex } from '@radix-ui/themes';
import { type PostViewType } from '@/types/posts';
import { usePostsContext } from '@/context/posts-context';
import useWindow from '@/hooks/use-window';
import { cn } from '@/lib/utils';
import MobileNavigationMenu from './mobile-navigation-menu';
import PostsTabs from '../posts-tabs';
import { BackButton } from '../buttons/back-button';
import { AppSidebar } from './app-sidebar';
import { useNavigationHistory, useScrollHeader } from '@/hooks';

interface StickyHeaderProps {
  headerRef: React.RefObject<HTMLElement>;
  isScrolled: boolean;
  isMobile: boolean;
  showHeaderTabs?: boolean;
  path: string;
  currentView?: PostViewType;
  setCurrentView?: (view: PostViewType) => void;
  user: any;
  onBack: () => void;
  showBack: boolean;
}

function StickyHeader({
  headerRef,
  isScrolled,
  isMobile,
  showHeaderTabs,
  path,
  currentView,
  setCurrentView,
  user,
  onBack,
  showBack,
}: StickyHeaderProps) {
  if (!isScrolled) return null;

  return (
    <div className="sticky top-0 z-40 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <Container size="2" maxWidth="630px">
        <header
          ref={headerRef}
          aria-label="Header"
          className={cn(
            'flex transition-all duration-300',
            isScrolled ? 'opacity-100' : 'pointer-events-none opacity-0',
          )}
        >
          <Flex direction="column" className="relative w-full overflow-hidden">
            {isMobile ? (
              <div className="flex w-full items-center px-4 py-2">
                <div className="flex w-full items-center justify-between">
                  <BackButton onBack={onBack} show={showBack} />
                  {path === '/' &&
                    currentView !== undefined &&
                    setCurrentView && (
                      <div className="flex-1 px-2">
                        <PostsTabs
                          currentView={currentView}
                          onViewChange={setCurrentView}
                          currentUserId={user?.id ?? null}
                        />
                      </div>
                    )}
                  <MobileNavigationMenu />
                </div>
              </div>
            ) : (
              path === '/' && (
                <Box
                  className={cn(
                    'box-border w-full',
                    showHeaderTabs
                      ? 'opacity-100'
                      : 'pointer-events-none opacity-0',
                  )}
                >
                  <div className="px-4">
                    {currentView !== undefined && setCurrentView && (
                      <PostsTabs
                        currentView={currentView}
                        onViewChange={setCurrentView}
                        currentUserId={user?.id ?? null}
                      />
                    )}
                  </div>
                </Box>
              )
            )}
          </Flex>
        </header>
      </Container>
    </div>
  );
}

export default function NavigationMenuShell() {
  const { isMobile } = useWindow();
  const path = usePathname();
  const router = useRouter();
  const { user, isSignedIn } = useUser();
  const headerRef = useRef<HTMLElement>(null);

  const { currentView, setCurrentView, showHeaderTabs, setShowHeaderTabs } =
    usePostsContext() ?? {};

  const { isScrolled, handleScroll } = useScrollHeader({
    path,
    headerRef,
    setShowHeaderTabs,
  });

  const { visitedPages, handleBack } = useNavigationHistory(path, router);

  const handleProfileClick = useCallback(() => {
    if (isSignedIn && user) {
      router.push(`/${user.username}`);
    }
  }, [isSignedIn, user, router]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const isCurrentPath = useCallback(
    (checkPath: string) => path === checkPath,
    [path],
  );

  const showBack = visitedPages.length > 1;

  return (
    <>
      {!isMobile && (
        <AppSidebar
          onBack={handleBack}
          showBack={showBack}
          isCurrentPath={isCurrentPath}
          handleProfileClick={handleProfileClick}
          isSignedIn={!!isSignedIn}
        />
      )}

      <StickyHeader
        headerRef={headerRef}
        isScrolled={isScrolled}
        isMobile={isMobile}
        showHeaderTabs={showHeaderTabs}
        path={path}
        currentView={currentView}
        setCurrentView={setCurrentView}
        user={user}
        onBack={handleBack}
        showBack={showBack}
      />
    </>
  );
}
