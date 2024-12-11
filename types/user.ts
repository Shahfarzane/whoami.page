import type { Prisma, User as PrismaUser } from '@prisma/client';

export type User = PrismaUser;

export type UserWithRelations = Prisma.UserGetPayload<{
  include: {
    contactMethods: true;
    projects: true;
    experiences: true;
    followers: true;
    following: true;
    _count: {
      select: { followers: true; following: true; posts: true };
    };
  };
}>;

export type {
  Projects as Project,
  ContactMethod,
  UserExperience,
} from '@prisma/client';
