import { useMutation, useQueryClient } from '@tanstack/react-query';
import { BaseUser } from '@/types/core';
import { updateProfile } from '@/app/_actions/user';

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: FormData) => {
      const updatedUser = await updateProfile(formData);
      return updatedUser as unknown as BaseUser;
    },
    onMutate: async (newUserData) => {
      await queryClient.cancelQueries({ queryKey: ['userData'] });
      const previousUserData = queryClient.getQueryData(['userData']);
      queryClient.setQueryData(['userData'], (old: any) => ({
        ...old,
        ...newUserData,
      }));
      return { previousUserData };
    },
    onError: (err, newUserData, context) => {
      queryClient.setQueryData(['userData'], context?.previousUserData);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['userData'] });
    },
  });
};
