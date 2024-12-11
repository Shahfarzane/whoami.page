import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import '@/styles/globals.css';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { ClerkProvider } from '@clerk/nextjs';
import { cn } from '@/lib/utils';
import ReactQueryProvider from '@/providers/react-query';
import { Container, Theme } from '@radix-ui/themes';
import { UserActionsProvider } from '@/context/user-actions-context';
import NavigationMenuShell from '@/components/navigation/navigation-menu-shell';
import MobileNavbar from '@/components/navigation/mobile-navbar';
import { cx } from 'class-variance-authority';
import { Suspense } from 'react';
import { SettingsModalProvider } from '@/providers/settings-modal-provider';
import { PostsProviderWrapper } from '@/app/posts-provider';
import { Toaster } from 'sonner';
import type { Metadata } from 'next';
import AuthenticationModal from '@/components/auth/sign-in';

export const metadata: Metadata = {
  metadataBase: new URL('https://whoami.page'),
  alternates: {
    canonical: '/',
  },
  title: {
    default: 'whoami.page',
    template: '%s | whoami.page',
  },
  description: 'Create a beautiful profile and explore job offers.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider dynamic>
      <html
        lang="en"
        className={cx('', GeistSans.variable, GeistMono.variable)}
        suppressHydrationWarning
      >
        <body className={cn('isolate min-h-screen font-sans antialiased')}>
          <Theme
            appearance="dark"
            accentColor="gray"
            radius="large"
            scaling="95%"
          >
            <ReactQueryProvider>
              <SettingsModalProvider>
                <UserActionsProvider>
                  <PostsProviderWrapper
                    initialView={{
                      view: 'all',
                    }}
                    initialShowHeaderTabs={false}
                  >
                    <NavigationMenuShell />
                    <Container
                      size="2"
                      maxWidth="640px"
                      className="flex-grow overflow-y-auto"
                    >
                      {children}
                      <Toaster richColors />
                    </Container>
                    <Suspense>
                      <AuthenticationModal />
                      <MobileNavbar />
                    </Suspense>
                  </PostsProviderWrapper>
                </UserActionsProvider>
              </SettingsModalProvider>
            </ReactQueryProvider>
          </Theme>
          <Suspense>
            <Analytics />
            <SpeedInsights />
          </Suspense>
        </body>
      </html>
    </ClerkProvider>
  );
}
