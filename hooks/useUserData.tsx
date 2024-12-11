import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getCurrentAuthUser } from '@/app/_services/user';
import { BaseUser } from '@/types/core';
import {
  Project,
  Experience,
  ContactMethod,
  ContactUrlType,
  Month,
} from '@/types/settings';

type DatabaseContactMethod = {
  id: string;
  userId: string;
  type: ContactUrlType;
  contactUsername: string;
};

type DatabaseProject = {
  id: string;
  client: string | null;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
  title: string;
  url: string | null;
  userId: string | null;
  startYear: string;
  authorId: string;
  images: string[];
  startMonth: Month;
};

type UserData = BaseUser & {
  projects: DatabaseProject[];
  experiences: DatabaseProject[];
  contactMethods: DatabaseContactMethod[];
};

export const useUserData = () => {
  return useQuery<UserData, Error>({
    queryKey: ['userData'],
    queryFn: async (): Promise<UserData> => {
      const userData = await getCurrentAuthUser();
      if (!userData) {
        throw new Error('User data is null');
      }
      return userData as unknown as UserData;
    },
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

export const updateUserDataCache = (
  queryClient: ReturnType<typeof useQueryClient>,
  key: 'projects' | 'experiences' | 'contactMethods',
  updater: (oldData: any[]) => any[],
) => {
  queryClient.setQueryData<UserData>(
    ['userData'],
    (oldData: UserData | undefined) => {
      if (!oldData) return oldData;
      return {
        ...oldData,
        [key]: updater(oldData[key] || []),
      };
    },
  );
};

export const updateSpecificItemInCache = (
  queryClient: ReturnType<typeof useQueryClient>,
  key: 'projects' | 'experiences' | 'contactMethods',
  itemId: string,
  updatedItem: Project | Experience | ContactMethod,
) => {
  updateUserDataCache(queryClient, key, (oldItems) => {
    return oldItems.map((item) => (item.id === itemId ? updatedItem : item));
  });
};
