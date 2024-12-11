import React, { useState } from 'react';
import * as Clerk from '@clerk/elements/common';
import * as SignUp from '@clerk/elements/sign-up';
import { type ComponentProps } from 'react';
import { Spinner, Dialog, Button, Link } from '@radix-ui/themes';
import { FocusScope } from '@radix-ui/react-focus-scope';

function CustomProvider({
  children,
  provider,
}: {
  children: string;
  provider: ComponentProps<typeof Clerk.Connection>['name'];
}) {
  return (
    <Clerk.Loading scope={`provider:${provider}`}>
      {(isLoading) => (
        <Clerk.Connection name={provider}>
          <FocusScope trapped={false}>
            <Button
              radius="large"
              variant="soft"
              size="3"
              className="mx-auto w-full p-6 focus:outline-none"
            >
              <Clerk.Icon
                className={`flex transition-all duration-200 ${provider === 'github' ? 'invert' : ''}`}
              />
              <span className="inline-flex items-center justify-center gap-2 leading-loose">
                {isLoading ? (
                  <>
                    <Spinner />
                  </>
                ) : (
                  children
                )}
              </span>
            </Button>
          </FocusScope>
        </Clerk.Connection>
      )}
    </Clerk.Loading>
  );
}

function CustomSubmit({ children }: { children: string }) {
  return (
    <SignUp.Action
      className="inline-flex w-full select-none items-center justify-center space-x-1.5 rounded-lg border border-[rgb(37,37,37)] bg-[rgb(22,22,22)] py-3 text-sm text-[rgb(160,160,160)] transition duration-300 hover:border-[rgb(50,50,50)] hover:bg-[rgb(22,22,30)] hover:text-[rgb(243,243,243)] disabled:bg-[rgb(12,12,12)] disabled:text-[rgb(100,100,100)]"
      submit
    >
      <Clerk.Loading>
        {(isLoading) => (isLoading ? <Spinner /> : children)}
      </Clerk.Loading>
    </SignUp.Action>
  );
}

export default function SignUpComponent({
  children,
  onBackToSignIn,
}: {
  children?: React.ReactNode;
  onBackToSignIn: () => void;
}) {
  const [showEmailSignUp, setShowEmailSignUp] = useState(false);

  return (
    <SignUp.Root
      routing="virtual"
      fallback={
        <div className="flex flex-col items-center justify-center gap-3">
          <div className="text-center">
            <Dialog.Title weight="regular">Sign Up</Dialog.Title>
            <Dialog.Description>
              Already have an account?{' '}
              <Link href="#" onClick={onBackToSignIn}>
                Sign In
              </Link>
            </Dialog.Description>
          </div>
          <div className="flex w-80 flex-col items-center gap-10">
            <Clerk.GlobalError className="block font-mono text-red-400" />
            <div className="flex flex-col gap-2 self-stretch">
              <CustomProvider provider="github">
                Sign up with GitHub
              </CustomProvider>
              <CustomProvider provider="google">
                Sign up with Google
              </CustomProvider>
              {!showEmailSignUp && (
                <Button
                  variant="ghost"
                  size="3"
                  className="mx-auto w-full p-6 focus:outline-none"
                  onClick={() => setShowEmailSignUp(true)}
                >
                  Sign up with Email
                </Button>
              )}
            </div>
            {showEmailSignUp && (
              <>
                <Clerk.Field
                  className="flex w-full flex-col gap-4"
                  name="emailAddress"
                >
                  {(fieldState) => (
                    <>
                      <Clerk.Label className="sr-only">Email</Clerk.Label>
                      <Clerk.Input
                        className={`w-full rounded border border-[rgb(37,37,37)] bg-[rgb(12,12,12)] px-4 py-2 placeholder-[rgb(100,100,100)] ${
                          fieldState === 'error' && 'border-red-500'
                        }`}
                        placeholder="Enter your email address"
                      />
                      <Clerk.FieldError className="block w-full font-mono text-red-400" />
                    </>
                  )}
                </Clerk.Field>
                <Clerk.Field
                  className="flex w-full flex-col gap-4"
                  name="password"
                >
                  {(fieldState) => (
                    <>
                      <Clerk.Label className="sr-only">Password</Clerk.Label>
                      <Clerk.Input
                        className={`w-full rounded border border-[rgb(37,37,37)] bg-[rgb(12,12,12)] px-4 py-2 placeholder-[rgb(100,100,100)] ${
                          fieldState === 'error' && 'border-red-500'
                        }`}
                        type="password"
                        placeholder="Enter your password"
                      />
                      <Clerk.FieldError className="block w-full font-mono text-red-400" />
                    </>
                  )}
                </Clerk.Field>
                <CustomSubmit>Sign Up with Email</CustomSubmit>
              </>
            )}
          </div>
        </div>
      }
    >
      <div className="flex flex-col items-center justify-center gap-3">
        <div className="gap-2 text-center">
          <Dialog.Title weight="regular">Sign Up</Dialog.Title>
          <Dialog.Description className="text-sm">
            Already have an account? {''}
            <Link href="#" onClick={onBackToSignIn}>
              Sign In
            </Link>
          </Dialog.Description>
        </div>
        <SignUp.Step name="start">
          <div className="flex w-80 flex-col items-center gap-10">
            <Clerk.GlobalError className="block font-mono text-red-400" />
            <div className="flex flex-col gap-2 self-stretch">
              <CustomProvider provider="github">
                Sign up with GitHub
              </CustomProvider>
              <CustomProvider provider="google">
                Sign up with Google
              </CustomProvider>
            </div>

            {!showEmailSignUp && (
              <Link
                size="2"
                href="#"
                className="mx-auto"
                onClick={() => setShowEmailSignUp(true)}
              >
                Continue with Email
              </Link>
            )}
            {showEmailSignUp && (
              <>
                <Clerk.Field
                  className="flex w-full flex-col gap-4"
                  name="emailAddress"
                >
                  {(fieldState) => (
                    <>
                      <Clerk.Label className="sr-only">Email</Clerk.Label>
                      <Clerk.Input
                        className={`w-full rounded border border-[rgb(37,37,37)] bg-[rgb(12,12,12)] px-4 py-2 placeholder-[rgb(100,100,100)] ${
                          fieldState === 'error' && 'border-red-500'
                        }`}
                        placeholder="Enter your email address"
                      />
                      <Clerk.FieldError className="block w-full font-mono text-red-400" />
                    </>
                  )}
                </Clerk.Field>
                <Clerk.Field
                  className="flex w-full flex-col gap-4"
                  name="password"
                >
                  {(fieldState) => (
                    <>
                      <Clerk.Label className="sr-only">Password</Clerk.Label>
                      <Clerk.Input
                        className={`w-full rounded border border-[rgb(37,37,37)] bg-[rgb(12,12,12)] px-4 py-2 placeholder-[rgb(100,100,100)] ${
                          fieldState === 'error' && 'border-red-500'
                        }`}
                        type="password"
                        placeholder="Enter your password"
                      />
                      <Clerk.FieldError className="block w-full font-mono text-red-400" />
                    </>
                  )}
                </Clerk.Field>
                <CustomSubmit>Sign Up with Email</CustomSubmit>
              </>
            )}
          </div>
        </SignUp.Step>
        <SignUp.Step
          name="verifications"
          className="flex w-80 flex-col items-center gap-6"
        >
          <h3>Verify email code</h3>
          <Clerk.GlobalError className="block font-mono text-red-400" />
          <SignUp.Strategy name="email_code">
            <Clerk.Field className="flex w-full flex-col gap-4" name="code">
              {(fieldState) => (
                <>
                  <Clerk.Label className="sr-only">Code</Clerk.Label>
                  <Clerk.Input
                    className={`w-full rounded border border-[rgb(37,37,37)] bg-[rgb(12,12,12)] px-4 py-2 placeholder-[rgb(100,100,100)] ${
                      fieldState === 'error' && 'border-red-500'
                    }`}
                    placeholder="Enter your verification code"
                  />
                  <Clerk.FieldError className="block w-full font-mono text-red-400" />
                </>
              )}
            </Clerk.Field>
            <CustomSubmit>Verify</CustomSubmit>
          </SignUp.Strategy>
          <SignUp.Action asChild navigate="start">
            <Button variant="ghost">Go back</Button>
          </SignUp.Action>
        </SignUp.Step>
      </div>
    </SignUp.Root>
  );
}
