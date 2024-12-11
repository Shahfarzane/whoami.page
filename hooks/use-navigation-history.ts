import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function useNavigationHistory(
  path: string,
  router: ReturnType<typeof useRouter>,
) {
  const [visitedPages, setVisitedPages] = useState<string[]>([]);

  useEffect(() => {
    setVisitedPages((prev) =>
      prev[prev.length - 1] !== path ? [...prev, path] : prev,
    );
  }, [path]);

  const handleBack = useCallback(() => {
    if (visitedPages.length > 1) {
      const previousPage = visitedPages[visitedPages.length - 2];
      setVisitedPages((prev) => prev.slice(0, -1));
      if (previousPage) {
        router.push(previousPage);
      }
    }
  }, [visitedPages, router]);

  return { visitedPages, handleBack };
}
