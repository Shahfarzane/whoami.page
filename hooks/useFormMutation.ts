import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export const useFormMutation = <TData, TResponse>(
  mutationFn: (data: TData) => Promise<TResponse>,
  queryKey: string[],
  successMessage: string,
  errorMessage: string,
  optimisticUpdate: (oldData: any, newData: TData) => any,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onMutate: async (newData) => {
      await queryClient.cancelQueries({ queryKey });
      const previousData = queryClient.getQueryData(queryKey);

      queryClient.setQueryData(queryKey, (old: any) =>
        optimisticUpdate(old, newData),
      );

      return { previousData };
    },
    onError: (err, newData, context: any) => {
      queryClient.setQueryData(queryKey, context.previousData);
      toast.error(`${errorMessage}: ${err.message}`);
    },
    onSuccess: (data) => {
      toast.success(successMessage);
      return data;
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });
};
