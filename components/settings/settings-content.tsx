import React, { useCallback, useMemo } from 'react';
import { BaseUser } from '@/types/core';
import {
  Project,
  Experience,
  ContactMethod,
  SectionKeys,
  Month,
} from '@/types/settings';
import settingsFormConfig from '@/lib/form-config';
import ProfileLayout from '@/components/settings/profile-layout';
import ItemForm from './entity-form';
import { Text, Flex, Separator, Box } from '@radix-ui/themes';
import { useUserData, updateUserDataCache } from '@/hooks/useUserData';
import { useQueryClient } from '@tanstack/react-query';
import SettingsListItem from '@/components/settings/settings-list-item';

const monthOrder: Record<Month, number> = {
  [Month.JANUARY]: 1,
  [Month.FEBRUARY]: 2,
  [Month.MARCH]: 3,
  [Month.APRIL]: 4,
  [Month.MAY]: 5,
  [Month.JUNE]: 6,
  [Month.JULY]: 7,
  [Month.AUGUST]: 8,
  [Month.SEPTEMBER]: 9,
  [Month.OCTOBER]: 10,
  [Month.NOVEMBER]: 11,
  [Month.DECEMBER]: 12,
};

const sortByStartDate = (a: Project | Experience, b: Project | Experience) => {
  if (a.startYear !== b.startYear) {
    return parseInt(b.startYear) - parseInt(a.startYear);
  }
  return monthOrder[b.startMonth] - monthOrder[a.startMonth];
};

interface SettingsContentProps {
  selectedItem: SectionKeys;
  edit: boolean;
  user: BaseUser;
  contactMethods: ContactMethod[];
  isEditing: string | null;
  isCreatingNew: boolean;
  setIsEditing: (editing: string | null) => void;
  setIsCreatingNew: (creating: boolean) => void;
  onSave: (data: any) => Promise<any>;
  onDelete: (id: string) => Promise<void>;
  formRef: React.RefObject<{ submit: () => void; reset: () => void }>;
  onGeneralFieldChange: (isEditing: boolean) => void;
}

const SettingsContent: React.FC<SettingsContentProps> = ({
  selectedItem,
  edit,
  user,
  contactMethods,
  isEditing,
  isCreatingNew,
  setIsEditing,
  setIsCreatingNew,
  onSave,
  onDelete,
  formRef,
  onGeneralFieldChange,
}) => {
  const { data: userData } = useUserData();
  const queryClient = useQueryClient();

  const currentUser = userData || user;
  const currentContactMethods = userData?.contactMethods || contactMethods;

  const sortedItems = useMemo(() => {
    let items: Array<Project | Experience | ContactMethod> = [];
    if (selectedItem === 'contactMethods') {
      items = currentContactMethods as ContactMethod[];
    } else if (selectedItem === 'projects-list') {
      items = [
        ...((currentUser as BaseUser & { projects?: Project[] }).projects ||
          []),
      ].sort(sortByStartDate);
    } else if (selectedItem === 'experiences-list') {
      items = [
        ...((currentUser as BaseUser & { experiences?: Experience[] })
          .experiences || []),
      ].sort(sortByStartDate);
    }
    return items;
  }, [selectedItem, currentUser, currentContactMethods]);

  const config = settingsFormConfig[selectedItem as SectionKeys];

  const handleSaveWithOptimisticUpdate = useCallback(
    async (data: any) => {
      if (selectedItem === 'general' || !('queryKey' in config)) {
        await onSave(data);
        return;
      }

      const tempId = 'temp-' + Date.now();

      updateUserDataCache(
        queryClient,
        config.queryKey[1] as any,
        (oldItems) => {
          if (isEditing) {
            return oldItems
              .map((item: any) =>
                item.id === data.id ? { ...item, ...data } : item,
              )
              .sort(sortByStartDate);
          } else {
            return [...oldItems, { ...data, id: tempId }].sort(sortByStartDate);
          }
        },
      );

      try {
        const result = await onSave(data);
        updateUserDataCache(
          queryClient,
          config.queryKey[1] as any,
          (oldItems) => {
            if (isEditing) {
              return oldItems
                .map((item: any) =>
                  item.id === (result.id || data.id)
                    ? { ...item, ...result }
                    : item,
                )
                .sort(sortByStartDate);
            } else {
              return [
                ...oldItems.filter((item: any) => item.id !== tempId),
                { ...result, id: result.id || tempId },
              ].sort(sortByStartDate);
            }
          },
        );
        return result;
      } catch (error) {
        updateUserDataCache(
          queryClient,
          config.queryKey[1] as any,
          (oldItems) => oldItems.filter((item: any) => item.id !== tempId),
        );
        console.error('Error saving item:', error);
        throw error;
      }
    },
    [isEditing, onSave, queryClient, config, selectedItem],
  );

  const handleDeleteWithOptimisticUpdate = useCallback(
    async (id: string) => {
      if (selectedItem === 'general' || !('queryKey' in config)) return;

      updateUserDataCache(queryClient, config.queryKey[1] as any, (oldItems) =>
        oldItems.filter((item: any) => item.id !== id),
      );

      try {
        await onDelete(id);
      } catch (error) {
        queryClient.invalidateQueries({ queryKey: config.queryKey });
        console.error('Error deleting item:', error);
        throw error;
      }
    },
    [onDelete, queryClient, config, selectedItem],
  );
  if (selectedItem === 'general') {
    return (
      <Box className="my-3">
        <ProfileLayout
          user={currentUser}
          edit={edit}
          formRef={formRef}
          setOpen={() => setIsEditing(null)}
          onFieldChange={onGeneralFieldChange}
        />
      </Box>
    );
  }

  if (!config || 'component' in config) {
    return <div>Invalid selection</div>;
  }

  if (isEditing || isCreatingNew) {
    const currentItem = isEditing
      ? sortedItems.find((item) => item.id === isEditing)
      : null;
    const defaultValues = currentItem || {};

    return (
      <ItemForm
        id={isEditing || undefined}
        defaultValues={defaultValues}
        onSave={handleSaveWithOptimisticUpdate}
        formRef={formRef}
        setIsEditing={(editing) => setIsEditing(editing ? isEditing : null)}
        fields={config.fields}
        createAction={config.createAction}
        updateAction={config.updateAction}
        removeImageAction={config.removeImageAction}
        queryKey={config.queryKey}
        successMessage={config.successMessage}
        errorMessage={config.errorMessage}
        itemType={config.itemType}
      />
    );
  }

  return (
    <div className="my-3 flex-grow">
      {sortedItems.length > 0 ? (
        <Flex direction="column" gap="3">
          {sortedItems.filter(Boolean).map((item, index, array) => (
            <React.Fragment key={item.id}>
              <SettingsListItem
                item={item}
                edit={edit}
                config={config}
                onEdit={(id) => setIsEditing(id)}
                onDelete={handleDeleteWithOptimisticUpdate}
              />
              {index < array.length - 1 && (
                <Separator size="4" my="3" className="bg-border" />
              )}
            </React.Fragment>
          ))}
        </Flex>
      ) : (
        <Text as="p" size="2" color="gray">
          No items to display.{' '}
          {config.itemType ? `Add a ${config.itemType}` : 'Add an item'} to get
          started.
        </Text>
      )}
    </div>
  );
};
export default SettingsContent;
