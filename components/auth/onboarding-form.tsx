'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useUser } from '@clerk/nextjs';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { setupAccount, completeOnboarding } from '@/app/_actions/user';
import { Button, Dialog, Flex, Text, TextField } from '@radix-ui/themes';
import { FormSchema } from '@/app/_lib/schema';

interface OnboardingFormProps {
  username?: string;
  fullName?: string;
}

export default function OnboardingForm({
  username = '',
  fullName = '',
}: OnboardingFormProps) {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: { username, fullName },
  });

  const setupMutation = useMutation({
    mutationFn: setupAccount,
    onSuccess: async (_, variables) => {
      try {
        const result = await completeOnboarding(
          variables.userId,
          variables.username,
          variables.fullName,
        );
        if (result.message !== 'User metadata Updated') {
          toast.error(result.message);
          return;
        }
        await queryClient.invalidateQueries({ queryKey: ['user'] });
        await user?.reload();
        router.push(`/${variables.username}`);
        toast.success(`Welcome to whoami, ${variables.username}!`);
      } catch (error) {
        toast.error('Error completing onboarding');
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Something went wrong!');
    },
  });

  const handleAccountSetup = (data: z.infer<typeof FormSchema>) => {
    if (user?.id) {
      setupMutation.mutate({ userId: user.id, ...data });
    } else {
      toast.error('User not authenticated');
    }
  };

  if (!isLoaded || !user) {
    return <div>Loading...</div>;
  }

  return (
    <Dialog.Root defaultOpen>
      <Dialog.Content style={{ maxWidth: 440 }}>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleAccountSetup)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <TextField.Root placeholder="Name" {...field} />
                  </FormControl>
                  {form.formState.errors.fullName && (
                    <Text as="p" color="red" size="2">
                      {form.formState.errors.fullName.message}
                    </Text>
                  )}
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <TextField.Root placeholder="Username" {...field} />
                  </FormControl>
                  {form.formState.errors.username && (
                    <Text as="p" color="red" size="2">
                      {form.formState.errors.username.message}
                    </Text>
                  )}
                </FormItem>
              )}
            />
            <Flex justify="end">
              <Button
                type="submit"
                disabled={setupMutation.isPending}
                size="2"
                variant="surface"
              >
                {setupMutation.isPending ? 'Processing...' : 'Continue →'}
              </Button>
            </Flex>
          </form>
        </Form>
      </Dialog.Content>
    </Dialog.Root>
  );
}
