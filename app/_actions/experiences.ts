'use server';

import { currentUser } from '@clerk/nextjs/server';
import db from '@/app/_lib/db';
import { experienceSchema } from '@/app/_lib/schema';
import { revalidatePath } from 'next/cache';

export const createExperience = async (formData: FormData) => {
  const user = await currentUser();
  if (!user) throw new Error('User not authenticated');

  const data = {
    title: formData.get('title'),
    company: formData.get('company'),
    description: formData.get('description'),
    url: formData.get('url') || null,
    startMonth: formData.get('startMonth'),
    startYear: formData.get('startYear'),
    endMonth:
      formData.get('endMonth') === '_empty_' ? null : formData.get('endMonth'),
    endYear:
      formData.get('endYear') === '_empty_' ? null : formData.get('endYear'),
  };

  const validatedData = experienceSchema.parse(data);

  const experience = await db.userExperience.create({
    data: { ...validatedData, authorId: user.id },
  });

  revalidatePath(`/${user.username}`);
  return experience;
};

export const updateExperience = async (formData: FormData) => {
  const user = await currentUser();
  if (!user) throw new Error('User not authenticated');

  const id = formData.get('id') as string;
  if (!id) throw new Error('Experience ID is required');

  const data = {
    title: formData.get('title'),
    company: formData.get('company'),
    description: formData.get('description'),
    url: formData.get('url') || null,
    startMonth: formData.get('startMonth'),
    startYear: formData.get('startYear'),
    endMonth:
      formData.get('endMonth') === '_empty_' ? null : formData.get('endMonth'),
    endYear:
      formData.get('endYear') === '_empty_' ? null : formData.get('endYear'),
  };

  const validatedData = experienceSchema.parse(data);

  const experience = await db.userExperience.update({
    where: { id, authorId: user.id },
    data: validatedData,
  });

  revalidatePath(`/${user.username}`);
  return experience;
};

export const deleteExperience = async (formData: FormData | string) => {
  const user = await currentUser();
  if (!user) throw new Error('User not authenticated');

  const id =
    typeof formData === 'string' ? formData : formData.get('id')?.toString();
  if (!id) throw new Error('Experience ID is required');

  const experience = await db.userExperience.findUnique({
    where: { id, authorId: user.id },
  });

  if (!experience) {
    throw new Error(
      'Experience not found or you do not have permission to delete it',
    );
  }

  await db.userExperience.delete({
    where: { id, authorId: user.id },
  });

  revalidatePath(`/${user.username}`);
  return { success: true };
};
export const removeExperienceImage = async (formData: FormData) => {
  const user = await currentUser();
  if (!user) throw new Error('User not authenticated');

  const experienceId = formData.get('experienceId') as string;
  const imageUrl = formData.get('imageUrl') as string;

  if (!experienceId) throw new Error('Experience ID is required');
  if (!imageUrl) throw new Error('Image URL is required');

  const experience = await db.userExperience.findUnique({
    where: {
      id: experienceId,
      authorId: user.id,
    },
  });

  if (!experience) throw new Error('Experience not found');

  const updatedImages = experience.images.filter((img) => img !== imageUrl);

  return db.userExperience.update({
    where: { id: experienceId },
    data: { images: updatedImages },
  });
};
