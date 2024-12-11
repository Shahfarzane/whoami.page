export {};

declare global {
  interface CustomJwtSessionClaims {
    metadata: {
      onboardingComplete?: boolean;
      fullName?: string;
      username: string;
    };
    firstName?: string;
  }
}
