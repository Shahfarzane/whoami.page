import React from 'react';
import { Button, Flex, Box, Separator } from '@radix-ui/themes';
import type { UserWithRelations } from '@/types/user';
import { SectionKeys } from '@/types/settings';
import { BaseUser } from '@/types/core';
import SettingsToolbar from '@/components/settings/settings-toolbar';
import SettingsSidebar from '@/components/settings/settings-sidebar';
import { useSettingsState } from '@/hooks/useSettingsState';
import SettingsContent from '@/components/settings/settings-content';

interface SettingsLayoutProps {
  edit: boolean;
  selectedItem: SectionKeys;
  getTitle: (item: SectionKeys) => string;
  setSelectedItem: (item: SectionKeys) => void;
  closeModal: () => void;
  user: UserWithRelations;
}

export default function SettingsLayout({
  edit,
  selectedItem,
  getTitle,
  setSelectedItem,
  closeModal,
  user,
}: SettingsLayoutProps) {
  const {
    formRef,
    isEditing,
    isCreatingNew,
    isGeneralEditing,
    isMobileView,
    showSidebar,
    handleSave,
    handleDelete,
    setIsEditing,
    setIsCreatingNew,
    setShowSidebar,
    handleGeneralFieldChange,
    handleBack,
    handleCreateNewClick,
    handleSelectItem,
  } = useSettingsState({ user, selectedItem, setSelectedItem });

  const isAnyEditing =
    isCreatingNew ||
    isEditing !== null ||
    (selectedItem === 'general' && isGeneralEditing);
  const showBackButton = isMobileView
    ? !showSidebar || isEditing !== null || isCreatingNew
    : isEditing !== null || isCreatingNew;

  const sidebarItems = [
    { id: 'general' as const, name: 'General' },
    { id: 'projects-list' as const, name: 'Projects' },
    { id: 'experiences-list' as const, name: 'Experiences' },
    { id: 'contactMethods' as const, name: 'Contacts' },
  ];

  const baseUser: BaseUser = {
    id: user.id,
    username: user.username,
    email: user.email,
    profileImage: user.profileImage,
    fullName: user.fullName,
    verified: user.verified,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    authorId: user.id,
  };

  const transformedContactMethods = user.contactMethods.map((cm) => ({
    ...cm,
    createdAt: new Date(),
    updatedAt: new Date(),
    authorId: user.id,
  }));

  return (
    <Flex direction="column" className="h-full w-full">
      <Flex className="w-full flex-grow overflow-hidden">
        {(showSidebar || !isMobileView) && (
          <Box
            flexShrink="0"
            width={isMobileView ? '100%' : '240px'}
            className="no-scrollbar"
          >
            <SettingsSidebar<SectionKeys>
              items={sidebarItems}
              selectedItem={selectedItem}
              onSelectItem={handleSelectItem}
              isMobileView={isMobileView}
              showSidebar={showSidebar}
            />
          </Box>
        )}
        {!isMobileView && <Separator orientation="vertical" size="4" />}

        {(!isMobileView || !showSidebar) && (
          <Box className="no-scrollbar w-full flex-grow overflow-y-auto p-4">
            <SettingsToolbar
              showBackButton={showBackButton}
              handleBack={handleBack}
              getTitle={getTitle}
              selectedItem={selectedItem}
              edit={edit}
              isCreatingNew={isCreatingNew}
              isEditing={isEditing}
              isMobileView={isMobileView}
              showSidebar={showSidebar}
              handleCreateNewClick={handleCreateNewClick}
            />
            <SettingsContent
              selectedItem={selectedItem}
              edit={edit}
              user={baseUser}
              contactMethods={transformedContactMethods}
              isEditing={isEditing}
              isCreatingNew={isCreatingNew}
              setIsEditing={setIsEditing}
              setIsCreatingNew={setIsCreatingNew}
              onSave={handleSave}
              onDelete={handleDelete}
              formRef={formRef}
              onGeneralFieldChange={handleGeneralFieldChange}
            />
          </Box>
        )}
      </Flex>
      <Separator size="4" />
      <Box p="4">
        <Flex justify="end" gap="3">
          {isAnyEditing ? (
            <>
              <Button variant="soft" color="red" onClick={closeModal}>
                Cancel
              </Button>
              <Button
                onClick={() => formRef.current?.submit()}
                variant="soft"
                color="gray"
              >
                Save
              </Button>
            </>
          ) : (
            <Button variant="soft" onClick={closeModal}>
              Done
            </Button>
          )}
        </Flex>
      </Box>
    </Flex>
  );
}
