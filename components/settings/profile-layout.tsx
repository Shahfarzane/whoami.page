import React, { useState, useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic';
import ProfileForm from '@/components/settings/profile-form';
import { useUserActions } from '@/context/user-actions-context';
import { BaseUser } from '@/types/core';
import { Flex } from '@radix-ui/themes';

const AvatarWithUpload = dynamic(
  () => import('@/components/user/user-avatar-with-upload'),
  {
    ssr: false,
  },
);

interface ProfileLayoutProps {
  user: BaseUser;
  edit: boolean;
  formRef: React.RefObject<{ submit: () => void; reset: () => void }>;
  setOpen: (open: boolean) => void;
  onFieldChange: (isEditing: boolean) => void;
}

const ProfileLayout: React.FC<ProfileLayoutProps> = ({
  user,
  edit,
  formRef,
  setOpen,
  onFieldChange,
}) => {
  const { handleFileChange, isImageUploading, profileImage, setProfileImage } =
    useUserActions();
  const displayedProfileImage = profileImage || user.profileImage || '';
  const [isEditing, setIsEditing] = useState(false);
  const [formValues, setFormValues] = useState<BaseUser>(user);

  const handleFieldChange = useCallback((name: string, value: any) => {
    setFormValues((prevValues: BaseUser) => ({
      ...prevValues,
      [name]: value,
    }));
  }, []);

  useEffect(() => {
    const hasChanges = Object.keys(user).some((key) => {
      return (
        JSON.stringify(user[key as keyof BaseUser]) !==
        JSON.stringify(formValues[key as keyof BaseUser])
      );
    });
    setIsEditing(hasChanges);
    onFieldChange(hasChanges);
  }, [formValues, user, onFieldChange]);

  return (
    <>
      <Flex direction="column" gap="4">
        <Flex align="center" gap="4">
          <AvatarWithUpload
            profileImage={displayedProfileImage}
            username={user.username ?? ''}
            edit={edit}
            isImageUploading={isImageUploading}
            handleFileChange={(file) => {
              handleFileChange(file);
              handleFieldChange('profileImage', file);
            }}
          />
        </Flex>
        <ProfileForm
          user={user}
          onSave={() => {
            setOpen(false);
            setIsEditing(false);
            onFieldChange(false);
          }}
          formRef={formRef}
          onFieldChange={handleFieldChange}
        />
      </Flex>
    </>
  );
};

export default ProfileLayout;
