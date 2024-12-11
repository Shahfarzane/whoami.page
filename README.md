# whoami.page 🚀

A modern, open-source platform for creating and sharing professional profiles. Built with Next.js, TypeScript, and Prisma.

[![License: AGPL-3.0](https://img.shields.io/badge/License-AGPL%203.0-blue.svg)](https://github.com/shahfarzane/whoami.page/blob/main/LICENSE)
[![Commercial License](https://img.shields.io/badge/License-Commercial-red.svg)](https://github.com/shahfarzane/whoami.page/blob/main/COMMERCIAL_LICENSE.md)

## 🌟 Features

- **Professional Profiles**: Create and customize your professional profile
- **Experience Timeline**: Showcase your work experience and projects
- **Social Integration**: Connect with other professionals and share updates
- **Project Showcase**: Display your portfolio projects with rich media support
- **Real-time Updates**: Engage with your network through posts and interactions
- **Multi-platform Contact**: Integrated contact methods (Twitter, LinkedIn, GitHub, etc.)

## 🛠️ Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Database**: PostgreSQL with [Prisma ORM](https://www.prisma.io/)
- **Authentication**: [Clerk](https://clerk.com/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with [Radix UI](https://www.radix-ui.com/)
- **File Upload**: [uploadthing](https://uploadthing.com/)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/)
- **Form Handling**: [React Hook Form](https://react-hook-form.com/) with [Zod](https://zod.dev/)

## 📋 Prerequisites

- Node.js 18+
- PostgreSQL database (Recommended: Neon.tech)
- Clerk account for authentication
- Uploadthing account for file uploads

## 🔧 Service Setup

### Database Setup

1. **Create Neon Database**

   - Visit [neon.tech](https://neon.tech)
   - Create new project
   - Copy connection strings (DATABASE_URL and DIRECT_URL)

2. **Configure Database URLs**
   ```env
   DATABASE_URL="postgres://user:pass@host/db?sslmode=require"
   DIRECT_URL="postgres://user:pass@host/db?sslmode=require"
   ```

### File Upload Setup

1. **Create Uploadthing Account**

   - Visit [uploadthing.com](https://uploadthing.com)
   - Create new project
   - Copy API keys

2. **Configure API**

   ```typescript
   // app/api/uploadthing/core.ts
   import { createUploadthing, type FileRouter } from 'uploadthing/next';

   const f = createUploadthing();

   export const ourFileRouter = {
     imageUploader: f({ image: { maxFileSize: '4MB' } })
       .middleware(async ({ req }) => {
         return { userId: req.userId };
       })
       .onUploadComplete(async ({ metadata, file }) => {
         return { fileUrl: file.url };
       }),
   } satisfies FileRouter;
   ```

### Authentication Setup

1. **Create Clerk Application**
   - Visit [Clerk Dashboard](https://dashboard.clerk.dev/)
   - Create new application
   - Configure OAuth (GitHub, Google)
   - Set up webhooks

Detailed authentication setup in [AUTHENTICATION.md](AUTHENTICATION.md)

## 🚀 Getting Started

1. **Clone the repository**

   ```bash
   git clone https://github.com/shahfarzane/whoami.page.git
   cd whoami.page
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   bun install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env
   ```

4. **Set up the database**

   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Run the development server**
   ```bash
   npm run dev
   # or
   bun dev
   ```

## 🔑 Environment Variables

```env
# Database
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_..."
CLERK_SECRET_KEY="sk_..."
CLERK_WEBHOOK_SECRET="whsec_..."

# File Upload
UPLOADTHING_SECRET="sk_..."
UPLOADTHING_APP_ID="..."

# OAuth
GITHUB_CLIENT_ID="..."
GITHUB_CLIENT_SECRET="..."
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
```

## 📂 Project Structure

```
whoami.page/
├── app/                  # Next.js app directory
├── components/           # Reusable components
├── context/             # React context providers
├── hooks/               # Custom React hooks
├── lib/                 # Utility functions
├── prisma/              # Database schema
├── providers/           # Higher-order components
├── public/              # Static files
├── store/               # State management
├── styles/              # Global styles
└── types/               # TypeScript types
```

## 🔍 Schema Overview

Key models include:

- **User**: Professional profile information
- **Projects**: Portfolio projects showcase
- **UserExperience**: Work experience timeline
- **Posts**: Social updates and interactions
- **ContactMethod**: Multiple contact platforms

## 🚀 Deployment

The application can be deployed on:

- [Vercel](https://vercel.com)
- [Netlify](https://netlify.com)
- Self-hosted options

## 🛟 Support & Troubleshooting

Common issues and solutions:

1. **Database Connection**

   - Check connection strings
   - Verify SSL settings
   - Ensure proper permissions

2. **Authentication**

   - Verify OAuth callback URLs
   - Check environment variables
   - Validate webhook endpoints

3. **File Upload**
   - Check file size limits
   - Verify API keys
   - Confirm proper CORS settings

For support:

- Open an [issue](https://github.com/shahfarzane/whoami.page/issues)
- Check [documentation](https://github.com/shahfarzane/whoami.page/wiki)
- Join [discussions](https://github.com/shahfarzane/whoami.page/discussions)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open Pull Request

## 🔐 Licensing

- **Non-commercial**: [AGPL-3.0 License](LICENSE)
- **Commercial**: [Commercial License](COMMERCIAL_LICENSE.md)

---

Built with ❤️ by [@shahfarzane](https://github.com/shahfarzane)
