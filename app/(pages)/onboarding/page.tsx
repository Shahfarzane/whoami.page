import { generateUsername } from '@/app/_actions/user';
import OnboardingForm from '@/components/auth/onboarding-form';
import db from '@/app/_lib/db';
import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getUserEmail } from '@/lib/utils';

export default async function AccountPage() {
  const user = await currentUser();

  if (!user) {
    redirect('/sign-in?returnTo=/onboarding');
  }

  const email = getUserEmail(user);

  const isVerifiedUser = await db.user.findUnique({
    where: { email },
  });

  if (isVerifiedUser?.onboardingComplete) {
    redirect(`/${user.username}`);
  }

  const username = user.username || (await generateUsername());

  return (
    <div className="mx-auto flex h-[95vh] w-full max-w-lg flex-col items-center justify-center gap-6">
      <OnboardingForm username={username} fullName={user.fullName ?? ''} />
    </div>
  );
}
