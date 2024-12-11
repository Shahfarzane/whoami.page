'use server';

import { currentUser } from '@clerk/nextjs/server';
import db from '@/app/_lib/db';
import { projectSchema } from '@/app/_lib/schema';

const getImagesFromFormData = (formData: FormData): string[] => {
  const images: string[] = [];
  for (const [key, value] of formData.entries()) {
    if (key.startsWith('images[') && typeof value === 'string') {
      images.push(value);
    }
  }
  return images;
};

export const createProject = async (formData: FormData) => {
  const user = await currentUser();
  if (!user) throw new Error('User not authenticated');

  const images = getImagesFromFormData(formData);

  const data = {
    title: formData.get('title'),
    description: formData.get('description'),
    client: formData.get('client'),
    url: formData.get('url'),
    startMonth: formData.get('startMonth'),
    startYear: formData.get('startYear'),
    images,
  };

  const validatedData = projectSchema.parse(data);

  return db.projects.create({
    data: { ...validatedData, authorId: user.id },
  });
};

export const updateProject = async (formData: FormData) => {
  const user = await currentUser();
  if (!user) throw new Error('User not authenticated');

  const id = formData.get('id') as string;
  if (!id) throw new Error('Project ID is required');

  const images = getImagesFromFormData(formData);

  const data = {
    title: formData.get('title'),
    description: formData.get('description'),
    client: formData.get('client'),
    url: formData.get('url'),
    startMonth: formData.get('startMonth'),
    startYear: formData.get('startYear'),
    images,
  };

  const validatedData = projectSchema.parse(data);

  const currentProject = await db.projects.findUnique({
    where: { id, authorId: user.id },
  });

  if (!currentProject) {
    throw new Error(
      'Project not found or you do not have permission to edit it',
    );
  }

  return db.projects.update({
    where: { id, authorId: user.id },
    data: validatedData,
  });
};

export const deleteProject = async (formData: FormData | string) => {
  const user = await currentUser();
  if (!user) throw new Error('User not authenticated');

  const id =
    typeof formData === 'string' ? formData : formData.get('id')?.toString();
  if (!id) throw new Error('Project ID is required');

  // Verify ownership before deletion
  const project = await db.projects.findUnique({
    where: { id, authorId: user.id },
  });

  if (!project) {
    throw new Error(
      'Project not found or you do not have permission to delete it',
    );
  }

  return db.projects.delete({
    where: { id, authorId: user.id },
  });
};
export const removeProjectImage = async (formData: FormData) => {
  const user = await currentUser();
  if (!user) throw new Error('User not authenticated');

  const projectId = formData.get('projectId') as string;
  const imageUrl = formData.get('imageUrl') as string;

  if (!projectId) throw new Error('Project ID is required');
  if (!imageUrl) throw new Error('Image URL is required');

  const project = await db.projects.findUnique({
    where: {
      id: projectId,
      authorId: user.id,
    },
  });

  if (!project) throw new Error('Project not found');

  const updatedImages = project.images.filter((img) => img !== imageUrl);

  return db.projects.update({
    where: { id: projectId },
    data: { images: updatedImages },
  });
};
