import { Suspense } from 'react';
import { getUserData } from './getUserData';
import { auth } from '@clerk/nextjs/server';
import { Metadata } from 'next';
import UserLayoutContent from '@/components/user/profile-layout';
import { unstable_cache } from 'next/cache';
import { notFound } from 'next/navigation';

const getCachedUserData = unstable_cache(
  async (username: string) => getUserData(username),
  ['user-profile'],
  {
    revalidate: 3600,
    tags: ['user-data'],
  },
);

interface LayoutProps {
  children: React.ReactNode;
  params: { username: string };
}

export async function generateMetadata({
  params: { username },
}: LayoutProps): Promise<Metadata> {
  const user = await getCachedUserData(username);

  if (!user) {
    return { title: 'User not found' };
  }

  const title = user.fullName || user.username;
  const description = user.description || `${user.username}'s profile`;
  const url = process.env.NEXT_PUBLIC_APP_URL || 'https://whoami.page';

  return {
    title,
    description,
    metadataBase: new URL(url),
    alternates: { canonical: `/${username}` },
    openGraph: {
      title,
      description,
      url: `${url}/${username}`,
      type: 'profile',
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
  } satisfies Metadata;
}

export default async function Layout({ children, params }: LayoutProps) {
  const [{ userId }, user] = await Promise.all([
    auth(),
    getCachedUserData(params.username).catch(() => null),
  ]);

  if (!user) notFound();

  return (
    <div className="min-h-screen">
      <Suspense>
        <UserLayoutContent
          initialUser={user}
          edit={userId === user.id}
          currentUserId={userId}
        >
          {children}
        </UserLayoutContent>
      </Suspense>
    </div>
  );
}
