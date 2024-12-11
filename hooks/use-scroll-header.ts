import { useCallback, useState } from 'react';

interface UseScrollHeaderProps {
  path: string;
  headerRef: React.RefObject<HTMLElement>;
  setShowHeaderTabs?: (show: boolean) => void;
}

export function useScrollHeader({
  path,
  headerRef,
  setShowHeaderTabs,
}: UseScrollHeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);

  const handleScroll = useCallback(() => {
    const scrollPosition = window.scrollY;
    const newIsScrolled = scrollPosition > 0;
    setIsScrolled(newIsScrolled);

    if (path === '/' && headerRef.current) {
      const headerHeight = headerRef.current.offsetHeight;
      const newShowHeaderTabs = scrollPosition > headerHeight;
      setShowHeaderTabs?.(newShowHeaderTabs);
    }
  }, [path, setShowHeaderTabs, headerRef]);

  return { isScrolled, handleScroll };
}
