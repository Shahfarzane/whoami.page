import {
  Month,
  ContactUrlType,
  SettingsFormField,
  FieldConfiguration,
  SectionKeys,
} from '@/types/settings';

import {
  createProject,
  updateProject,
  removeProjectImage,
} from '@/app/_actions/projects';
import {
  createExperience,
  updateExperience,
  removeExperienceImage,
} from '@/app/_actions/experiences';
import { createContactMethod, updateContactMethod } from '@/app/_actions/user';
import ProfileGeneral from '@/components/settings/profile-layout';
import {
  deleteProjectAction,
  deleteExperienceAction,
  deleteContactAction,
} from '@/app/_actions/settings';

export const contactMethodFields: SettingsFormField[] = [
  {
    name: 'type',
    label: 'Contact Type',
    type: 'select',
    options: Object.values(ContactUrlType).map((type) => ({
      value: type,
      label: type,
    })),
    validation: {
      required: 'Contact type is required.',
    },
  },
  {
    name: 'contactUsername',
    label: 'Username',
    type: 'text',
    validation: {
      required: 'Username is required.',
    },
  },
];

export const projectFields: SettingsFormField[] = [
  {
    name: 'title',
    label: 'Project Name',
    type: 'text',
    required: true,
    validation: { required: 'Project name is required.' },
  },
  {
    name: 'client',
    label: 'Client',
    type: 'text',
    required: true,
    validation: { required: 'The client is mandatory.' },
  },
  {
    name: 'url',
    label: 'Project URL',
    type: 'url',
    validation: {
      pattern: {
        value: /^(ftp|http|https):\/\/[^ "]+$/,
        message: 'Enter a valid URL.',
      },
    },
  },
  {
    name: 'startMonth',
    label: 'Month',
    type: 'select',
    options: Object.values(Month).map((month) => ({
      value: month,
      label: month,
    })),
    required: true,
    validation: { required: 'The month is mandatory.' },
  },
  {
    name: 'startYear',
    label: 'Year',
    type: 'select',
    required: true,
    validation: { required: 'The year is mandatory.' },
    options: Array.from({ length: 10 }, (_, index) => ({
      value: (new Date().getFullYear() - index).toString(),
      label: (new Date().getFullYear() - index).toString(),
    })),
  },
  {
    name: 'description',
    label: 'Description',
    type: 'textarea',
    required: true,
    validation: { required: 'Description is mandatory.' },
  },
];

export const experienceFields: SettingsFormField[] = [
  {
    name: 'title',
    label: 'Job Title',
    type: 'text',
    required: true,
    validation: { required: 'Job title is required.' },
  },
  {
    name: 'company',
    label: 'Company',
    type: 'text',
    required: true,
    validation: { required: 'The company is mandatory.' },
  },
  {
    name: 'url',
    label: 'Company URL',
    type: 'url',
    validation: {
      pattern: {
        value: /^(ftp|http|https):\/\/[^ "]+$/,
        message: 'Enter a valid URL.',
      },
    },
  },
  {
    name: 'startMonth',
    label: 'Start Month',
    type: 'select',
    options: Object.values(Month).map((month) => ({
      value: month,
      label: month,
    })),
    required: true,
    validation: { required: 'The start month is mandatory.' },
  },
  {
    name: 'startYear',
    label: 'Start Year',
    type: 'select',
    required: true,
    validation: { required: 'The start year is mandatory.' },
    options: Array.from({ length: 10 }, (_, index) => ({
      value: (new Date().getFullYear() - index).toString(),
      label: (new Date().getFullYear() - index).toString(),
    })),
  },
  {
    name: 'endMonth',
    label: 'End Month',
    type: 'select',
    options: [
      { value: '_empty_', label: 'Present' },
      ...Object.values(Month).map((month) => ({ value: month, label: month })),
    ],
    required: false,
  },
  {
    name: 'endYear',
    label: 'End Year',
    type: 'select',
    required: false,
    options: [
      { value: '_empty_', label: 'Present' },
      ...Array.from({ length: 10 }, (_, index) => ({
        value: (new Date().getFullYear() - index).toString(),
        label: (new Date().getFullYear() - index).toString(),
      })),
    ],
  },
  {
    name: 'description',
    label: 'Description',
    type: 'textarea',
    validation: { required: 'Description is mandatory.' },
  },
];

export const profileFields: SettingsFormField[] = [
  {
    name: 'username',
    label: 'Username',
    type: 'text',
    required: true,
    validation: {
      required: 'Username is required.',
      maxLength: { value: 28, message: 'Username cannot exceed 28 characters' },
      minLength: {
        value: 4,
        message: 'Username must be at least 4 characters',
      },
    },
  },
  {
    name: 'fullName',
    label: 'Name',
    type: 'text',
    required: true,
    validation: {
      required: 'Name is required.',
      maxLength: { value: 32, message: 'Name cannot exceed 32 characters' },
      minLength: { value: 4, message: 'Name must be at least 3 characters' },
    },
  },
  {
    name: 'jobTitle',
    label: 'Job Title',
    type: 'text',
    validation: {
      maxLength: {
        value: 28,
        message: 'Job title cannot exceed 28 characters',
      },
    },
  },
  {
    name: 'website',
    label: 'Website',
    type: 'url',
    validation: {
      pattern: {
        value: /^(ftp|http|https):\/\/[^ "]+$/,
        message: 'Enter a valid URL.',
      },
    },
  },
  {
    name: 'location',
    label: 'Location',
    type: 'text',
    validation: {
      maxLength: { value: 28, message: 'Location cannot exceed 28 characters' },
    },
  },
  // { name: 'pronouns', label: 'Pronouns', type: 'text' },
  {
    name: 'description',
    label: 'About',
    type: 'textarea',
    validation: {
      maxLength: {
        value: 500,
        message: 'Description cannot exceed 500 characters',
      },
    },
  },
];

const createContactMethodWrapper = async (formData: FormData) => {
  const type = formData.get('type') as ContactUrlType;
  const contactUsername = formData.get('contactUsername') as string;
  return createContactMethod({ type, contactUsername });
};

const updateContactMethodWrapper = async (formData: FormData) => {
  const id = formData.get('id') as string;
  const type = formData.get('type') as ContactUrlType;
  const contactUsername = formData.get('contactUsername') as string;
  return updateContactMethod({ id, type, contactUsername });
};

export const settingsFormConfig: Record<SectionKeys, FieldConfiguration> = {
  'projects-list': {
    itemType: 'projects',
    displayName: 'Project',
    fields: projectFields,
    createAction: createProject,
    updateAction: updateProject,
    removeImageAction: async (formData: FormData) => {
      const id = formData.get('id') as string;
      const url = formData.get('url') as string;
      await removeProjectImage(formData);
    },
    queryKey: ['userData', 'projects'],
    successMessage: 'Project saved successfully',
    errorMessage: 'Failed to save project',
    deleteAction: deleteProjectAction,
  },
  'experiences-list': {
    itemType: 'experiences',
    displayName: 'Experience',
    fields: experienceFields,
    createAction: createExperience,
    updateAction: updateExperience,
    removeImageAction: async (formData: FormData) => {
      const id = formData.get('id') as string;
      const url = formData.get('url') as string;
      await removeExperienceImage(formData);
    },
    queryKey: ['userData', 'experiences'],
    successMessage: 'Experience saved successfully',
    errorMessage: 'Failed to save experience',
    deleteAction: deleteExperienceAction,
  },
  contactMethods: {
    itemType: 'contactMethods',
    displayName: 'Contact Method',
    fields: contactMethodFields,
    createAction: createContactMethodWrapper,
    updateAction: updateContactMethodWrapper,
    removeImageAction: async () => {},
    deleteAction: deleteContactAction,
    queryKey: ['userData', 'contactMethods'],
    successMessage: 'Contact method saved successfully',
    errorMessage: 'Failed to save contact method',
  },
  general: {
    component: ProfileGeneral,
  },
};

export default settingsFormConfig;
