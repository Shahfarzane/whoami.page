import { Month, ContactUrlType } from '@prisma/client';
import type { User } from './user';

interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  authorId: string;
}

export interface Project extends BaseEntity {
  title: string;
  description: string | null;
  client: string | null;
  url: string | null;
  images: string[];
  startMonth: Month;
  startYear: string;
}

export interface Experience extends BaseEntity {
  title: string;
  company: string;
  description: string;
  url: string | null;
  images: string[];
  startMonth: Month;
  startYear: string;
}

export interface ContactMethod extends BaseEntity {
  id: string;
  type: ContactUrlType;
  contactUsername: string;
  userId: string;
}

export interface FormHandle {
  submit: () => void;
  reset: () => void;
}

export type SectionKeys =
  | 'general'
  | 'projects-list'
  | 'experiences-list'
  | 'contactMethods';

export interface SettingsMainContentProps {
  selectedItem: SectionKeys;
  edit: boolean;
  user: User;
  contactMethods: ContactMethod[];
  isEditing: string | null;
  isCreatingNew: boolean;
  setIsEditing: (editing: string | null) => void;
  setIsCreatingNew: (creating: boolean) => void;
  onSave: (data: any) => Promise<any>;
  onDelete: (id: string) => Promise<void>;
  formRef: React.RefObject<FormHandle>;
  onGeneralFieldChange: (isEditing: boolean) => void;
}

export { Month, ContactUrlType };

export interface ValidationRule {
  required?: string;
  maxLength?: { value: number; message: string };
  minLength?: { value: number; message: string };
  pattern?: { value: RegExp; message: string };
}

export interface SettingsFormField {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'url' | 'email' | 'date';
  required?: boolean;
  validation?: ValidationRule;
  options?: Array<{ value: string; label: string }>;
}

export interface ItemFieldConfig {
  itemType: string;
  displayName: string;
  fields: SettingsFormField[];
  queryKey: [string, string];
  successMessage: string;
  errorMessage: string;
  createAction: (formData: FormData) => Promise<any>;
  updateAction: (formData: FormData) => Promise<any>;
  removeImageAction: (formData: FormData) => Promise<void>;
  deleteAction: (formData: FormData) => Promise<void>;
}

export interface GeneralFieldConfig {
  component: React.ComponentType<any>;
}

export type FieldConfiguration = ItemFieldConfig | GeneralFieldConfig;
