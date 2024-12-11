'use client';
import React, {
  FC,
  useImperativeHandle,
  useRef,
  useState,
  useCallback,
} from 'react';
import FormBuilder, { FormHandle } from '@/components/settings/form-builder';
import { profileFields } from '@/lib/form-config';
import { useUpdateProfile } from '@/hooks/useUpdateProfile';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { BaseUser } from '@/types/core';
import { useUserActions } from '@/context/user-actions-context';
import { Flex, Callout } from '@radix-ui/themes';

interface ProfileForm {
  user: BaseUser;
  onSave: () => void;
  formRef: React.RefObject<FormHandle>;
  onFieldChange: (name: string, value: any) => void;
}

const ProfileForm: FC<ProfileForm> = ({
  user,
  onSave,
  formRef,
  onFieldChange,
}) => {
  const { profileImage, setProfileImage } = useUserActions();
  const router = useRouter();
  const mutation = useUpdateProfile();
  const [localUser, setLocalUser] = useState(user);

  const handleSave = async (data: Partial<BaseUser>) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value.toString());
      }
    });

    if (profileImage) {
      formData.append('profileImage', profileImage);
    }

    mutation.mutate(formData, {
      onSuccess: (updatedUser) => {
        setLocalUser(updatedUser);
        toast.success('Profile updated successfully.');
        onSave();
        router.refresh();
      },
      onError: (error: Error) => {
        toast.error(`An error occurred: ${error.message}`);
      },
    });
  };

  const formSubmitRef = useRef<FormHandle>(null);
  useImperativeHandle(formRef, () => ({
    submit: () => {
      if (formSubmitRef.current) {
        formSubmitRef.current.submit();
      }
    },
    reset: () => {
      if (formSubmitRef.current) {
        formSubmitRef.current.reset();
      }
    },
  }));

  const handleFieldChange = useCallback(
    (name: string, value: any) => {
      console.log('Field change in ProfileForm:', name, value);
      onFieldChange(name, value);
    },
    [onFieldChange],
  );

  return (
    <Flex direction="column">
      <FormBuilder
        fields={profileFields}
        defaultValues={user}
        onSave={handleSave}
        ref={formSubmitRef}
        onFieldChange={handleFieldChange}
        fullWidth={true}
      />
      {mutation.isError && (
        <Callout.Root color="red">
          <Callout.Text>{mutation.error.message}</Callout.Text>
        </Callout.Root>
      )}
    </Flex>
  );
};

export default ProfileForm;
