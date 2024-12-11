'use client';
import React, { forwardRef, useState } from 'react';
import * as Clerk from '@clerk/elements/common';
import * as SignIn from '@clerk/elements/sign-in';
import Link from 'next/link';
import { type ComponentProps } from 'react';
import { Spinner, Dialog, Button, Text } from '@radix-ui/themes';
import SignUpComponent from '@/components/auth/sign-up';
import { OAuthStrategy } from '@clerk/types';
import { useSignIn, useSignUp } from '@clerk/nextjs';
import { useAuthStore } from '@/store/auth';

function CustomProvider({
  children,
  provider,
  onClick,
}: {
  children: string;
  provider: ComponentProps<typeof Clerk.Connection>['name'];
  onClick: () => any;
}) {
  return (
    <Clerk.Loading scope={`provider:${provider}`}>
      {(isLoading) => (
        <Clerk.Connection name={provider}>
          <Button
            radius="large"
            variant="soft"
            size="3"
            className="mx-auto w-full p-6"
          >
            <Clerk.Icon
              className={`flex transition-all duration-200 ${provider === 'github' ? 'invert' : ''}`}
            />
            <span className="inline-flex items-center justify-center gap-2 leading-loose">
              {isLoading ? <Spinner /> : children}
            </span>
          </Button>
        </Clerk.Connection>
      )}
    </Clerk.Loading>
  );
}

// Custom submit button component
function CustomSubmit({ children }: { children: string }) {
  return (
    <SignIn.Action submit>
      <Button
        radius="large"
        variant="surface"
        size="3"
        className="mx-auto px-6 py-4"
      >
        <Clerk.Loading>
          {(isLoading) => (isLoading ? <Spinner /> : children)}
        </Clerk.Loading>
      </Button>
    </SignIn.Action>
  );
}

// Custom resendable component
function CustomResendable() {
  return (
    <SignIn.Action
      fallback={({ resendableAfter }) => (
        <Text size="2">
          Didn&apos;t receive a code? Retry in {resendableAfter} seconds.
        </Text>
      )}
      resend
    >
      Didn&apos;t receive a code?{' '}
      <strong className="text-blue-400">Retry Now</strong>
    </SignIn.Action>
  );
}

// Custom dialog trigger component
function CustomDialogTrigger({ children }: { children: React.ReactNode }) {
  return (
    <Dialog.Trigger>
      <div tabIndex={-1}>{children}</div>
    </Dialog.Trigger>
  );
}

// Custom field component
function CustomField({
  label,
  name,
  ...props
}: {
  label: string;
  name: string;
  [key: string]: any;
}) {
  return (
    <Clerk.Field className="flex w-full flex-col gap-4" name={name}>
      {(fieldState) => (
        <>
          <Clerk.Label className="sr-only">{label}</Clerk.Label>
          <Clerk.Input
            className={`w-full rounded px-4 py-2 placeholder-[rgb(100,100,100)] ${
              fieldState === 'error' ? 'border-red-500' : ''
            }`}
            placeholder={`Enter your ${label}`}
            {...props}
          />
          <Clerk.FieldError className="block w-full font-mono text-red-400" />
        </>
      )}
    </Clerk.Field>
  );
}

const AuthenticationModal = forwardRef<
  HTMLDivElement,
  { children?: React.ReactNode }
>(({ children }, ref) => {
  const isOpen = useAuthStore((state) => state.isSignInModalOpen);
  const closeModal = useAuthStore((state) => state.closeSignInModal);
  const [continueWithEmail, setContinueWithEmail] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const { signIn } = useSignIn();
  const { signUp, setActive } = useSignUp();

  if (!signIn || !signUp) return null;

  if (!signIn || !signUp) return null;

  const signInWith = (strategy: OAuthStrategy) => {
    return signIn.authenticateWithRedirect({
      strategy,
      redirectUrl: '/sso-callback',
      redirectUrlComplete: '/',
    });
  };

  async function handleSignIn(strategy: OAuthStrategy) {
    if (!signIn || !signUp) return null;

    // If the user has an account in your application, but does not yet
    // have an OAuth account connected to it, you can transfer the OAuth
    // account to the existing user account.
    const userExistsButNeedsToSignIn =
      signUp.verifications.externalAccount.status === 'transferable' &&
      signUp.verifications.externalAccount.error?.code ===
        'external_account_exists';

    if (userExistsButNeedsToSignIn) {
      const res = await signIn.create({ transfer: true });

      if (res.status === 'complete') {
        setActive({
          session: res.createdSessionId,
        });
      }
    }

    // If the user has an OAuth account but does not yet
    // have an account in your app, you can create an account
    // for them using the OAuth information.
    const userNeedsToBeCreated =
      signIn.firstFactorVerification.status === 'transferable';

    if (userNeedsToBeCreated) {
      const res = await signUp.create({
        transfer: true,
      });

      if (res.status === 'complete') {
        setActive({
          session: res.createdSessionId,
        });
      }
    } else {
      // If the user has an account in your application
      // and has an OAuth account connected to it, you can sign them in.
      signInWith(strategy);
    }
  }
  return (
    <Dialog.Root open={isOpen} onOpenChange={closeModal}>
      <CustomDialogTrigger>{children}</CustomDialogTrigger>
      <Dialog.Content maxWidth="440px" aria-describedby={undefined}>
        {showSignUp ? (
          <SignUpComponent onBackToSignIn={() => setShowSignUp(false)} />
        ) : (
          <SignIn.Root
            routing="virtual"
            fallback={
              <div className="flex flex-col items-center justify-center gap-3">
                <div className="text-center">
                  <Dialog.Title weight="regular">Sign In</Dialog.Title>
                  <Dialog.Description>
                    Don't have an account?{' '}
                    <Link href="#" onClick={() => setShowSignUp(true)}>
                      Sign Up
                    </Link>
                  </Dialog.Description>
                </div>
                <div className="flex w-80 flex-col items-center gap-10">
                  <Clerk.GlobalError className="block font-mono text-red-400" />
                  <div className="flex flex-col gap-2 self-stretch">
                    <CustomProvider
                      provider="github"
                      onClick={() => handleSignIn('oauth_github')}
                    >
                      Continue with GitHub
                    </CustomProvider>
                    <CustomProvider
                      provider="google"
                      onClick={() => handleSignIn('oauth_google')}
                    >
                      Continue with Google
                    </CustomProvider>
                  </div>
                  {continueWithEmail ? (
                    <>
                      <CustomField label="Email" name="identifier" />
                      <CustomSubmit>Sign in with Email</CustomSubmit>
                    </>
                  ) : (
                    <Link href="" onClick={() => setContinueWithEmail(true)}>
                      Continue with Email
                    </Link>
                  )}
                </div>
              </div>
            }
          >
            <div className="flex flex-col items-center justify-center gap-3">
              <div className="gap-2 text-center">
                <Dialog.Title weight="regular">Sign In</Dialog.Title>
                <Dialog.Description className="text-sm">
                  Don't have an account?{' '}
                  <Link href="#" onClick={() => setShowSignUp(true)}>
                    Sign Up
                  </Link>
                </Dialog.Description>
              </div>
              <SignIn.Step name="start">
                <div className="flex w-80 flex-col items-center gap-10">
                  <Clerk.GlobalError className="block font-mono text-red-400" />
                  <div className="flex flex-col gap-2 self-stretch">
                    <CustomProvider
                      provider="github"
                      onClick={() => handleSignIn('oauth_github')}
                    >
                      Continue with GitHub
                    </CustomProvider>
                    <CustomProvider
                      provider="google"
                      onClick={() => handleSignIn('oauth_google')}
                    >
                      Continue with Google
                    </CustomProvider>
                  </div>
                  {continueWithEmail ? (
                    <>
                      <CustomField label="Email" name="identifier" />
                      <CustomSubmit>Sign in with Email</CustomSubmit>
                    </>
                  ) : (
                    <Link
                      className="text-xs"
                      href=""
                      onClick={() => setContinueWithEmail(true)}
                    >
                      Continue with Email
                    </Link>
                  )}
                </div>
              </SignIn.Step>
              <SignIn.Step
                name="choose-strategy"
                className="flex w-80 flex-col items-center gap-6"
              >
                <h3>CHOOSE STRATEGY:</h3>
                <CustomProvider
                  provider="github"
                  onClick={() => handleSignIn('oauth_github')}
                >
                  Continue with GitHub
                </CustomProvider>
                <CustomProvider
                  provider="google"
                  onClick={() => handleSignIn('oauth_google')}
                >
                  Continue with Google
                </CustomProvider>
                <SignIn.SupportedStrategy asChild name="password">
                  <Button>Password</Button>
                </SignIn.SupportedStrategy>
                <SignIn.SupportedStrategy asChild name="phone_code">
                  <Button>Send a code to your phone</Button>
                </SignIn.SupportedStrategy>
                <SignIn.SupportedStrategy asChild name="email_code">
                  <Button>Send a code to your email</Button>
                </SignIn.SupportedStrategy>
                <SignIn.Action asChild navigate="previous">
                  <Button variant="ghost">Go back</Button>
                </SignIn.Action>
              </SignIn.Step>
              <SignIn.Step
                name="forgot-password"
                className="flex w-80 flex-col items-center gap-6"
              >
                <h3>FORGOT PASSWORD:</h3>
                <SignIn.SupportedStrategy
                  asChild
                  name="reset_password_email_code"
                >
                  <Button>Reset your password via Email</Button>
                </SignIn.SupportedStrategy>
                <SignIn.SupportedStrategy
                  asChild
                  name="reset_password_phone_code"
                >
                  <Button>Reset your password via Phone</Button>
                </SignIn.SupportedStrategy>
                <p>Or</p>
                <CustomProvider
                  provider="github"
                  onClick={() => handleSignIn('oauth_github')}
                >
                  Continue with GitHub
                </CustomProvider>
                <CustomProvider
                  provider="google"
                  onClick={() => handleSignIn('oauth_google')}
                >
                  Continue with Google
                </CustomProvider>
                <SignIn.Action asChild navigate="previous">
                  <Button variant="ghost">Go back</Button>
                </SignIn.Action>
              </SignIn.Step>
              <SignIn.Step
                name="verifications"
                className="flex w-80 flex-col items-center gap-3"
              >
                <div className="flex w-full flex-col gap-6">
                  <Clerk.GlobalError className="block font-mono text-red-400" />
                  <SignIn.Strategy name="password">
                    <Text size="2" align="center">
                      Welcome back <SignIn.Salutation />!
                    </Text>
                    <CustomField
                      label="Password"
                      name="password"
                      type="password"
                    />
                    <CustomSubmit>Verify</CustomSubmit>
                    <SignIn.Action asChild navigate="forgot-password">
                      <Button variant="ghost">Forgot Password</Button>
                    </SignIn.Action>
                  </SignIn.Strategy>
                  <SignIn.Strategy name="email_code">
                    <Text size="2" align="center">
                      Welcome back! We've sent a temporary code to{' '}
                      <SignIn.SafeIdentifier />
                    </Text>
                    <CustomResendable />
                    <CustomField
                      autoFocus
                      autoSubmit
                      label="Email Code"
                      name="code"
                    />
                    <CustomSubmit>Verify</CustomSubmit>
                  </SignIn.Strategy>
                  <SignIn.Strategy name="phone_code">
                    <Text size="2">
                      Welcome back! We've sent a temporary code to{' '}
                      <SignIn.SafeIdentifier />
                    </Text>
                    <CustomResendable />
                    <CustomField
                      autoFocus
                      autoSubmit
                      label="Phone Code"
                      name="code"
                    />
                    <CustomSubmit>Verify</CustomSubmit>
                  </SignIn.Strategy>
                  <SignIn.Strategy name="reset_password_email_code">
                    <h3>Verify your email</h3>
                    <Text size="2">
                      We've sent a verification code to{' '}
                      <SignIn.SafeIdentifier />
                    </Text>
                    <CustomField label="Code" name="code" />
                    <CustomSubmit>Continue</CustomSubmit>
                  </SignIn.Strategy>
                  <SignIn.Strategy name="reset_password_phone_code">
                    <h3>Verify your phone number</h3>
                    <Text size="2">
                      We've sent a verification code to{' '}
                      <SignIn.SafeIdentifier />
                    </Text>
                    <CustomField label="Code" name="code" />
                    <CustomSubmit>Continue</CustomSubmit>
                  </SignIn.Strategy>
                </div>
                <SignIn.Action asChild navigate="choose-strategy">
                  <Button variant="ghost">Use another method</Button>
                </SignIn.Action>
              </SignIn.Step>
              <SignIn.Step name="reset-password">
                <div className="flex w-80 flex-col items-center gap-6">
                  <h3>Reset your password</h3>
                  <Text size="2">Please reset your password to continue:</Text>
                  <CustomField
                    label="New Password"
                    name="password"
                    type="password"
                  />
                  <CustomSubmit>Update Password</CustomSubmit>
                </div>
              </SignIn.Step>
            </div>
          </SignIn.Root>
        )}
      </Dialog.Content>
    </Dialog.Root>
  );
});
AuthenticationModal.displayName = 'AuthenticationModal';

export default AuthenticationModal;
