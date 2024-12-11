import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

interface SessionClaims {
  metadata?: {
    onboardingComplete?: boolean;
  };
  username?: string;
}

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { sessionClaims } = (await auth()) as { sessionClaims: SessionClaims };

  if (sessionClaims?.metadata?.onboardingComplete === true) {
    redirect(`/${sessionClaims.username}`);
  }

  return <>{children}</>;
}
