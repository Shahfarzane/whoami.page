'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/auth';
import { useRouter, useSearchParams } from 'next/navigation';

export default function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const openSignInModal = useAuthStore((state) => state.openSignInModal);
  const returnTo = searchParams.get('returnTo') || '/';

  useEffect(() => {
    openSignInModal();
    if (window.location.pathname !== returnTo) {
      router.push(returnTo);
    }
  }, [openSignInModal, router, returnTo]);

  return null;
}
