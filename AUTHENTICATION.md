# Authentication Setup Guide

## Initial Setup

1. Visit [Clerk Dashboard](https://dashboard.clerk.dev/)
2. Create new application
3. Select Next.js framework

## Dashboard Configuration

### User & Authentication

1. Navigate to User & Authentication > Email, Phone, Username
2. Enable:
   - Email addresses (Required, Used for sign-in, Verify at sign-up)
   - Phone numbers
   - Usernames
   - Name (First and Last)

### Sign-In Methods
- Email verification link
- Email verification code

### OAuth Providers

#### GitHub Setup
1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Create OAuth App:
   ```
   Name: whoami.page
   Homepage URL: http://localhost:3000
   Authorization callback URL: [Clerk Callback URL]
   ```
3. Copy credentials to Clerk Dashboard

#### Google Setup
1. Visit [Google Cloud Console](https://console.cloud.google.com)
2. Create/select project
3. Enable OAuth 2.0:
   ```
   Application type: Web application
   Authorized redirect URIs: [Clerk Callback URLs]
   ```
4. Copy credentials to Clerk Dashboard

### Configuration
1. Add Redirect URL: `localhost:3000/sso-callback`
2. Production URLs format: `https://your-domain.com/sso-callback`

### Session Token Setup
1. Go to Sessions
2. Edit token custom claims:
   ```json
   {
     "metadata": "{{user.public_metadata}}"
   }
   ```

## Implementation

### Installation
```bash
npm install @clerk/nextjs @clerk/themes
```

### Environment Variables
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

```

### Provider Setup
```typescript
// app/layout.tsx
import { ClerkProvider } from '@clerk/nextjs';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      {children}
    </ClerkProvider>
  );
}
```

### Route Protection
```typescript
// middleware.ts
import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  publicRoutes: ["/", "/api/webhook/clerk", "/sso-callback"],
  ignoredRoutes: ["/api/webhook/clerk"]
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
```



### Components

#### Sign In
```typescript
// components/auth/sign-in.tsx
import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <SignIn
      appearance={{
        elements: {
          formButtonPrimary: 'bg-primary hover:bg-primary/80',
          socialButtonsIconButton: 'border-border bg-background hover:bg-accent',
        },
      }}
    />
  );
}
```

#### SSO Callback
```typescript
// app/sso-callback/page.tsx
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { redirect } from "next/navigation";

export default function SSOCallback() {
  return (
    <>
      <SignedIn>
        {redirect('/')}
      </SignedIn>
      <SignedOut>
        {redirect('/sign-in')}
      </SignedOut>
    </>
  );
}
```

## Troubleshooting

### OAuth Issues
1. Verify callback URLs match exactly
2. Check environment variables
3. Confirm OAuth provider configuration



### Session Token Issues
1. Clear browser cache/cookies
2. Verify custom claims syntax
3. Check token expiration settings