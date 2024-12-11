'use server';

import { deleteProject } from './projects';
import { deleteExperience } from './experiences';
import { deleteContact } from './user';

export async function deleteProjectAction(formData: FormData) {
  const id = formData.get('id')?.toString();
  if (!id) throw new Error('Project ID is required');
  await deleteProject(id);
}

export async function deleteExperienceAction(formData: FormData) {
  const id = formData.get('id')?.toString();
  if (!id) throw new Error('Experience ID is required');
  await deleteExperience(id);
}

export async function deleteContactAction(formData: FormData) {
  const id = formData.get('id')?.toString();
  if (!id) throw new Error('Contact ID is required');
  await deleteContact(formData);
}
