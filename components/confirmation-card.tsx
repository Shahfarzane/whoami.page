'use client';

import React from 'react';
import { toast } from 'sonner';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deletePost } from '@/app/_actions/posts';
import { VisuallyHidden, AlertDialog, Button, Flex } from '@radix-ui/themes';
import { CheckIcon } from '@radix-ui/react-icons';

interface ConfirmationCardProps {
  id: string;
  parentId?: string;
  onClose: () => void;
}

const ConfirmationCard: React.FC<ConfirmationCardProps> = ({
  id,
  parentId,
  onClose,
}) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => deletePost(id),
    onSuccess: async () => {
      queryClient.setQueryData(['posts'], (oldData: any) => ({
        ...oldData,
        data: oldData?.data?.filter((post: any) => post.id !== id) ?? [],
      }));

      if (parentId) {
        queryClient.setQueryData(
          ['replies', parentId],
          (oldData: any) =>
            oldData?.filter((reply: any) => reply.id !== id) ?? [],
        );

        queryClient.setQueryData(['post', parentId], (oldData: any) => ({
          ...oldData,
          _count: {
            ...oldData?._count,
            replyCount: (oldData?._count?.replyCount ?? 1) - 1,
          },
        }));
      }

      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['post', id] });
      if (parentId) {
        queryClient.invalidateQueries({ queryKey: ['replies', parentId] });
        queryClient.invalidateQueries({ queryKey: ['post', parentId] });
      }

      onClose();
    },
    onError: (error) => {
      toast.error('Failed to delete post');
    },
  });

  function handleDeletePost() {
    const promise = mutation.mutateAsync();

    toast.promise(promise, {
      success: () => (
        <div className="flex w-[270px] items-center justify-between p-0">
          <div className="flex items-center justify-center gap-1.5">
            <CheckIcon className="h-5 w-5" />
            Deleted
          </div>
        </div>
      ),
      error: 'Error',
    });
    onClose();
  }

  return (
    <AlertDialog.Root open={true}>
      <AlertDialog.Trigger>
        <Button variant="ghost" color="red">
          Delete
        </Button>
      </AlertDialog.Trigger>
      <AlertDialog.Content size="2" maxWidth="440px">
        <VisuallyHidden>
          <AlertDialog.Title>Delete</AlertDialog.Title>
        </VisuallyHidden>
        <AlertDialog.Description size="2">
          This action cannot be undone. This will permanently delete your post
          from our servers.
        </AlertDialog.Description>

        <Flex gap="3" mt="4" justify="end">
          <AlertDialog.Cancel>
            <Button variant="soft" color="gray" onClick={onClose}>
              Cancel
            </Button>
          </AlertDialog.Cancel>

          <AlertDialog.Action>
            <Button variant="solid" color="red" onClick={handleDeletePost}>
              Delete
            </Button>
          </AlertDialog.Action>
        </Flex>
      </AlertDialog.Content>
    </AlertDialog.Root>
  );
};

export default ConfirmationCard;
