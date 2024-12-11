import { useCallback, useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { UserWithRelations } from '@/types/user';
import type { FormHandle, SectionKeys } from '@/types/settings';
import fieldConfigurations from '@/lib/form-config';

interface UseSettingsStateProps {
  user: UserWithRelations;
  selectedItem: SectionKeys;
  setSelectedItem: (item: SectionKeys) => void;
}

export function useSettingsState({
  user,
  selectedItem,
  setSelectedItem,
}: UseSettingsStateProps) {
  const queryClient = useQueryClient();
  const formRef = useRef<FormHandle>(null);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [isGeneralEditing, setIsGeneralEditing] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth <= 768);
      setShowSidebar(true);
    };

    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSave = useCallback(
    async (updatedItem: any) => {
      try {
        // Call server action from fieldConfigurations
        const config = fieldConfigurations[selectedItem as SectionKeys];
        if ('updateAction' in config) {
          const formData = new FormData();
          // Add all fields to FormData
          Object.entries(updatedItem).forEach(([key, value]) => {
            formData.append(key, value as string);
          });
          await config.updateAction(formData);
        }

        // Update cache after successful server mutation
        queryClient.setQueryData(['userData'], (oldData: any) => ({
          ...oldData,
          [selectedItem.replace('-list', '')]: oldData[
            selectedItem.replace('-list', '')
          ].map((item: any) =>
            item.id === updatedItem.id ? updatedItem : item,
          ),
        }));

        setIsEditing(null);
        setIsCreatingNew(false);

        // Invalidate to ensure sync with server
        await queryClient.invalidateQueries({ queryKey: ['userData'] });

        return updatedItem;
      } catch (error) {
        throw error;
      }
    },
    [queryClient, selectedItem],
  );

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        // Optimistically remove from UI
        queryClient.setQueryData(['userData'], (oldData: any) => ({
          ...oldData,
          [selectedItem.replace('-list', '')]: oldData[
            selectedItem.replace('-list', '')
          ].filter((item: { id: string }) => item.id !== id),
        }));

        // Call server action from fieldConfigurations
        const config = fieldConfigurations[selectedItem as SectionKeys];
        if ('deleteAction' in config) {
          const formData = new FormData();
          formData.append('id', id);
          await config.deleteAction(formData);
        }

        // Invalidate to ensure sync with server
        await queryClient.invalidateQueries({ queryKey: ['userData'] });
      } catch (error) {
        // Revert optimistic update on error
        await queryClient.invalidateQueries({ queryKey: ['userData'] });
      }
    },
    [queryClient, selectedItem],
  );

  const handleGeneralFieldChange = useCallback((isEditing: boolean) => {
    setIsGeneralEditing(isEditing);
  }, []);

  const handleBack = useCallback(() => {
    if (isMobileView) {
      if (isEditing || isCreatingNew) {
        setIsEditing(null);
        setIsCreatingNew(false);
      } else {
        setShowSidebar(true);
      }
    } else if (isEditing || isCreatingNew) {
      setIsEditing(null);
      setIsCreatingNew(false);
    }
  }, [isMobileView, isEditing, isCreatingNew]);

  const handleCreateNewClick = useCallback(() => {
    setIsCreatingNew(true);
    setIsEditing(null);
    if (isMobileView) setShowSidebar(false);
  }, [isMobileView]);

  const handleSelectItem = useCallback(
    (item: SectionKeys) => {
      setSelectedItem(item);
      if (isMobileView) setShowSidebar(false);
      setIsEditing(null);
      setIsCreatingNew(false);
    },
    [isMobileView, setSelectedItem],
  );

  return {
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
  };
}
