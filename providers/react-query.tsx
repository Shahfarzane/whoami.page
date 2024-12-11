'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export default function ReactQueryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
            retry: process.env.NODE_ENV === 'production' ? 3 : 0,
          },
          mutations: {
            retry: process.env.NODE_ENV === 'production' ? 3 : 0,
            onError: (error: unknown) => {
              if (process.env.NODE_ENV === 'production') {
                // Send to error tracking service
              }
            },
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
