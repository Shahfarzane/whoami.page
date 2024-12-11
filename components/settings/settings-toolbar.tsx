import React from 'react';
import { Button, Flex, Dialog, Separator } from '@radix-ui/themes';
import { ChevronLeftIcon, PlusIcon } from '@radix-ui/react-icons';
import {
  SectionKeys,
  FieldConfiguration,
  ItemFieldConfig,
} from '@/types/settings';
import settingsFormConfig from '@/lib/form-config';

interface SettingsToolbarProps {
  showBackButton: boolean;
  handleBack: () => void;
  getTitle: (item: SectionKeys) => string;
  selectedItem: SectionKeys;
  edit: boolean;
  isCreatingNew: boolean;
  isEditing: string | null;
  isMobileView: boolean;
  showSidebar: boolean;
  handleCreateNewClick: () => void;
}

const SettingsToolbar: React.FC<SettingsToolbarProps> = ({
  showBackButton,
  handleBack,
  getTitle,
  selectedItem,
  edit,
  isCreatingNew,
  isEditing,
  isMobileView,
  showSidebar,
  handleCreateNewClick,
}) => {
  const config = settingsFormConfig[selectedItem];
  const isItemConfig = (
    config: FieldConfiguration,
  ): config is ItemFieldConfig => 'displayName' in config;

  const showAddButton =
    edit &&
    !isCreatingNew &&
    isEditing === null &&
    selectedItem !== 'general' &&
    config &&
    isItemConfig(config) &&
    (!isMobileView || !showSidebar);

  const addButtonText =
    showAddButton && isItemConfig(config) ? `Add ${config.displayName}` : '';

  const BackButton = showBackButton && (
    <Button variant="soft" onClick={handleBack}>
      <ChevronLeftIcon />
    </Button>
  );

  const Title = selectedItem !== 'general' && (
    <Dialog.Title weight="regular" size="3" my="auto" trim="end">
      {getTitle(selectedItem)}
    </Dialog.Title>
  );

  const AddButtonMobile = showAddButton && (
    <Button onClick={handleCreateNewClick} variant="soft">
      <PlusIcon />
    </Button>
  );

  const AddButtonDesktop = showAddButton && (
    <Button onClick={handleCreateNewClick} variant="soft" color="gray">
      {addButtonText}
    </Button>
  );

  const isAddingOrEditing = isCreatingNew || isEditing !== null;

  return (
    <Flex direction="column" width="full">
      <Flex
        justify="between"
        width="full"
        align="center"
        mb="3"
        className="sm:hidden"
      >
        <Flex style={{ width: '33%', justifyContent: 'flex-start' }}>
          {BackButton}
        </Flex>
        <Flex style={{ width: '33%', justifyContent: 'center' }}>{Title}</Flex>
        <Flex style={{ width: '33%', justifyContent: 'flex-end' }}>
          {AddButtonMobile}
        </Flex>
      </Flex>

      {/* Desktop View */}
      <Flex justify="between" align="center" mb="3" className="hidden sm:flex">
        <Flex align="center" style={{ flex: isAddingOrEditing ? 1 : 'none' }}>
          {BackButton}
        </Flex>
        <Flex
          style={{
            flex: isAddingOrEditing ? 1 : 'auto',
            justifyContent: isAddingOrEditing ? 'center' : 'flex-start',
          }}
        >
          {Title}
        </Flex>
        <Flex
          style={{
            flex: isAddingOrEditing ? 1 : 'none',
            justifyContent: 'flex-end',
          }}
        >
          {AddButtonDesktop}
        </Flex>
      </Flex>

      {selectedItem !== 'general' && <Separator size="4" />}
    </Flex>
  );
};

export default SettingsToolbar;
