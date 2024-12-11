import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default async function AuthLayout({ children }: AuthLayoutProps) {
  const user = await currentUser();
  if (user) {
    return redirect(`/${user.username}`);
  }

  return (
    <div className="absolute left-2/4 top-2/4 z-50 w-full -translate-x-2/4 -translate-y-2/4 px-4 sm:-translate-y-[40%] sm:px-0">
      {children}
    </div>
  );
}
