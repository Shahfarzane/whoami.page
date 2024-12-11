// schemas/zodSchemas.ts

import { z } from 'zod';
import { Month, ContactUrlType } from '@prisma/client';

export const projectSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, 'Title is required'),
  description: z.string().nullable().optional(),
  url: z.string().url().nullable().optional(),
  startMonth: z.nativeEnum(Month),
  startYear: z.string(),
  client: z.string().nullable().optional(),
  images: z.array(z.string()).optional(),
});

export const experienceSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  company: z.string().min(1, 'Company is required'),
  description: z.string().min(1, 'Description is required'),
  url: z.string().url().nullable().optional(),
  startMonth: z.nativeEnum(Month),
  startYear: z.string().regex(/^\d{4}$/, 'Start year must be a 4-digit number'),
  endMonth: z.nativeEnum(Month).nullable().optional(),
  endYear: z
    .string()
    .regex(/^\d{4}$/, 'End year must be a 4-digit number')
    .nullable()
    .optional(),
  images: z.array(z.string()).optional(),
});

export type ExperienceSchema = z.infer<typeof experienceSchema>;
export type ExperienceSchemaType = z.infer<typeof experienceSchema>;
export const contactMethodSchema = z.object({
  id: z.string().optional(),
  type: z.nativeEnum(ContactUrlType),
  contactUsername: z.string().min(1, 'Username is required'),
});

export const FormSchema = z.object({
  username: z
    .string()
    .nonempty('Username is required')
    .min(3, { message: 'Username must be at least 3 characters long' })
    .max(20, { message: 'Username must be at most 20 characters long' })
    .regex(/^[a-zA-Z0-9_]+$/, {
      message: 'Username can only contain letters, numbers, and underscores',
    }),
  fullName: z.string().nonempty('Name is required'),
});

export const urlPatterns: Record<ContactUrlType, string> = {
  FIGMA: 'https://www.figma.com/@',
  GITHUB: 'https://github.com/',
  LINKEDIN: 'https://www.linkedin.com/in/',
  TWITTER: 'https://twitter.com/',
  EMAIL: 'mailto:',
  PHONE: 'tel:',
} as const;

export { ContactUrlType };
