'use client';

import { useEffect, useState, useRef } from 'react';

export default function PostFeedSkeleton() {
  const [show, setShow] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const startTimeRef = useRef(performance.now());
  const instanceId = useRef(Math.random().toString(36).slice(2, 8));
  const hasLoggedMount = useRef(false);
  const isShowing = useRef(false);

  useEffect(() => {
    if (!hasLoggedMount.current) {
      hasLoggedMount.current = true;
    }

    const MINIMUM_DELAY = 100;
    const MAXIMUM_DELAY = 500;

    timeoutRef.current = setTimeout(() => {
      const elapsed = performance.now() - startTimeRef.current;
      if (elapsed < MINIMUM_DELAY) {
        return;
      }
      if (!isShowing.current) {
        isShowing.current = true;
        setShow(true);
      }
    }, MINIMUM_DELAY);

    const maxTimeout = setTimeout(() => {
      if (!isShowing.current) {
        isShowing.current = true;
        setShow(true);
      }
    }, MAXIMUM_DELAY);

    return () => {
      clearTimeout(timeoutRef.current);
      clearTimeout(maxTimeout);
    };
  }, []);

  if (!show) return null;

  return (
    <div className="duration-300 animate-in fade-in">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex gap-3 border-b border-border p-4">
          <div className="h-10 w-10 animate-pulse rounded-full bg-gray-200 dark:bg-gray-800" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-1/4 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
            <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
          </div>
        </div>
      ))}
    </div>
  );
}
