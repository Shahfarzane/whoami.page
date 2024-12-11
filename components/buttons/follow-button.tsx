'use client';
import React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toggleFollow, batchCheckFollowStatus } from '@/app/_actions/user';
import { Button } from '@radix-ui/themes';
import type { FollowerUser } from '@/types/core';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';

interface FollowButtonProps {
  profileUser: FollowerUser;
  currentUserId: string | null;
}

export default function FollowButton({
  profileUser,
  currentUserId,
}: FollowButtonProps) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { data: followStatusMap, isLoading } = useQuery({
    queryKey: ['followStatus', profileUser.id],
    queryFn: async () =>
      batchCheckFollowStatus([profileUser.id], currentUserId),
    enabled: !!currentUserId, // Only run the query if the user is logged in
  });

  const { mutate: toggleFollowMutation, isPending } = useMutation({
    mutationFn: () => toggleFollow(profileUser.id),
    onMutate: async () => {
      await queryClient.cancelQueries({
        queryKey: ['followStatus', profileUser.id],
      });
      await queryClient.cancelQueries({
        queryKey: ['followersData', profileUser.id],
      });
      await queryClient.cancelQueries({ queryKey: ['user', profileUser.id] });
      await queryClient.cancelQueries({ queryKey: ['user', currentUserId] });

      const previousFollowState = followStatusMap?.[profileUser.id];

      queryClient.setQueryData(['followStatus', profileUser.id], {
        [profileUser.id]: !previousFollowState,
      });

      queryClient.setQueryData(['user', profileUser.id], (oldData: any) => {
        if (!oldData) return oldData;
        const change = previousFollowState ? -1 : 1;
        return {
          ...oldData,
          _count: {
            ...oldData._count,
            followers: (oldData._count?.followers ?? 0) + change,
          },
        };
      });

      queryClient.setQueryData(['user', currentUserId], (oldData: any) => {
        if (!oldData) return oldData;
        const change = previousFollowState ? -1 : 1;
        return {
          ...oldData,
          _count: {
            ...oldData._count,
            following: (oldData._count?.following ?? 0) + change,
          },
        };
      });

      return { previousFollowState };
    },
    onError: (error, variables, context) => {
      queryClient.setQueryData(['followStatus', profileUser.id], {
        [profileUser.id]: context?.previousFollowState,
      });
      queryClient.setQueryData(['user', profileUser.id], (oldData: any) => {
        if (!oldData) return oldData;
        const change = context?.previousFollowState ? 1 : -1;
        return {
          ...oldData,
          _count: {
            ...oldData._count,
            followers: (oldData._count?.followers ?? 0) + change,
          },
        };
      });
      queryClient.setQueryData(['user', currentUserId], (oldData: any) => {
        if (!oldData) return oldData;
        const change = context?.previousFollowState ? 1 : -1;
        return {
          ...oldData,
          _count: {
            ...oldData._count,
            following: (oldData._count?.following ?? 0) + change,
          },
        };
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['followStatus', profileUser.id],
      });
      queryClient.invalidateQueries({
        queryKey: ['followersData', profileUser.id],
      });
      queryClient.invalidateQueries({ queryKey: ['user', profileUser.id] });
      queryClient.invalidateQueries({ queryKey: ['user', currentUserId] });
    },
  });
  const isFollowing = followStatusMap?.[profileUser.id] ?? false;

  const handleFollow = () => {
    if (!currentUserId) {
      useAuthStore.getState().openSignInModal();
      return;
    }
    toggleFollowMutation();
  };
  return (
    <Button
      size="1"
      radius="large"
      className="border border-strong hover:border-stronger hover:bg-selection"
      color="gray"
      disabled={isPending || isLoading}
      onClick={handleFollow}
      variant={isFollowing ? 'soft' : 'surface'}
    >
      {isFollowing ? 'Following' : 'Follow'}
    </Button>
  );
}
