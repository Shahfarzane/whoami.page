'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { AlertDialog, Flex, Button } from '@radix-ui/themes';

interface SettingsDeleteItemProps {
  id: string;
  itemName: string;
  deleteAction: (formData: FormData) => Promise<any>;
  invalidateQueryKey: string | string[];
  successMessage: string;
  errorMessage: string;
  trigger?: React.ReactNode;
}

const SettingsDeleteItem: React.FC<SettingsDeleteItemProps> = ({
  id,
  itemName,
  deleteAction,
  invalidateQueryKey,
  successMessage,
  errorMessage,
  trigger,
}) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      const formData = new FormData();
      formData.append('id', id);
      return await deleteAction(formData);
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: [invalidateQueryKey] });
      const previousData = queryClient.getQueryData([invalidateQueryKey]);
      queryClient.setQueryData([invalidateQueryKey], (old: any) => {
        return Array.isArray(old)
          ? old.filter((item: any) => item.id !== id)
          : old;
      });
      return { previousData };
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [invalidateQueryKey] });
      toast.success(successMessage);
      router.refresh();
      setOpen(false);
    },
    onError: (error: any, _, context) => {
      queryClient.setQueryData([invalidateQueryKey], context?.previousData);
      toast.error(errorMessage, {
        description: `${error.message}`,
      });
    },
    onSettled: () => {
      setLoading(false);
      queryClient.invalidateQueries({ queryKey: [invalidateQueryKey] });
    },
  });

  const handleDelete = () => {
    setLoading(true);
    mutation.mutate();
  };

  return (
    <AlertDialog.Root open={open} onOpenChange={setOpen}>
      <AlertDialog.Trigger>
        {trigger || (
          <Button variant="ghost" size="1" className="hover:text-red-500">
            Delete
          </Button>
        )}
      </AlertDialog.Trigger>
      <AlertDialog.Content maxWidth="440px">
        <AlertDialog.Title weight="regular">Delete</AlertDialog.Title>
        <AlertDialog.Description size="2">
          This action cannot be undone. This will permanently delete your data
          from our servers.
        </AlertDialog.Description>
        <Flex gap="3" mt="4" justify="end">
          <AlertDialog.Cancel>
            <Button variant="soft" color="gray">
              Cancel
            </Button>
          </AlertDialog.Cancel>
          <AlertDialog.Action>
            <Button
              variant="solid"
              color="red"
              onClick={handleDelete}
              disabled={loading}
            >
              {loading ? 'Deleting...' : 'Delete'}
            </Button>
          </AlertDialog.Action>
        </Flex>
      </AlertDialog.Content>
    </AlertDialog.Root>
  );
};

export default SettingsDeleteItem;
