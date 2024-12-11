'use client';

import React, { useState } from 'react';
import { useSettingsModal } from '@/providers/settings-modal-provider';
import { Dialog } from '@radix-ui/themes';
import SettingsLayout from '@/components/settings/settings-layout';
import { useUserData } from '@/hooks/useUserData';
import { SectionKeys } from '@/types/settings';
import { UserWithRelations } from '@/types/user';

interface SettingsDialogProps {
  user: UserWithRelations;
  edit: boolean;
}

const SettingsDialog: React.FC<SettingsDialogProps> = ({ user, edit }) => {
  const { closeModal, isOpen } = useSettingsModal();
  const { data: userData, isLoading, error } = useUserData();
  const [selectedItem, setSelectedItem] = useState<SectionKeys>('general');

  const handleCloseModal = () => {
    setSelectedItem('general');
    closeModal();
  };

  const getTitle = (item: SectionKeys) => {
    switch (item) {
      case 'projects-list':
        return 'Projects';
      case 'experiences-list':
        return 'Experiences';
      case 'contactMethods':
        return 'Contacts';
      default:
        return 'General';
    }
  };

  // Always render the Dialog.Root, but handle states within Dialog.Content
  return (
    <Dialog.Root open={isOpen} onOpenChange={handleCloseModal}>
      <Dialog.Content
        aria-describedby={undefined}
        className="h-[600px] w-full max-w-[45rem] overflow-auto bg-panel p-0"
      >
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <div className="animate-spin">Loading...</div>
          </div>
        ) : error ? (
          <div className="flex h-full items-center justify-center text-red-500">
            Error loading user data
          </div>
        ) : (
          <SettingsLayout
            edit={edit}
            selectedItem={selectedItem}
            getTitle={getTitle}
            setSelectedItem={setSelectedItem}
            closeModal={handleCloseModal}
            user={user || userData}
          />
        )}
      </Dialog.Content>
    </Dialog.Root>
  );
};

export default SettingsDialog;
