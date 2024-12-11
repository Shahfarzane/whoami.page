import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { User } from '@clerk/nextjs/server';
import type { UserResource } from '@clerk/types';
import { AuthorInfo } from '@/types/index';
import { Project } from '@/types/user';
import { Post } from '@/types/posts';
import type { SearchItem as SearchItemType } from '@/types/search';

import {
  differenceInSeconds,
  differenceInMinutes,
  differenceInHours,
  differenceInDays,
  differenceInWeeks,
} from 'date-fns';
import { Month, UserExperience } from '@prisma/client';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export function formatEnumString(str: string): string {
  return str.toLowerCase().replace(/^\w/, (c) => c.toUpperCase());
}

export function formatContactMethodType(type: string): string {
  if (type.toUpperCase() === 'EMAIL') return 'Email';

  return formatEnumString(type);
}

export function getUserEmail(user: UserResource | User | null) {
  const email =
    user?.emailAddresses?.find((e) => e.id === user.primaryEmailAddressId)
      ?.emailAddress ?? '';

  return email;
}

export function getFullName(firstName: string | null, lastName: string | null) {
  if (
    !lastName ||
    lastName === undefined ||
    lastName === null ||
    lastName === ''
  ) {
    return firstName;
  }

  return `${firstName} ${lastName}`;
}

export function formatTimeAgo(timestamp: Date): string {
  const now = new Date();
  const secondsDiff = Math.floor(differenceInSeconds(now, timestamp));
  const minutesDiff = Math.floor(differenceInMinutes(now, timestamp));
  const hoursDiff = Math.floor(differenceInHours(now, timestamp));
  const daysDiff = Math.floor(differenceInDays(now, timestamp));
  const weeksDiff = Math.floor(differenceInWeeks(now, timestamp));

  if (secondsDiff < 60) {
    return `${secondsDiff}s`;
  } else if (minutesDiff < 60) {
    return `${minutesDiff}m`;
  } else if (hoursDiff < 24) {
    return `${hoursDiff}h`;
  } else if (daysDiff < 7) {
    return `${daysDiff}d`;
  } else {
    return `${weeksDiff}w`;
  }
}

export function getItemLink(item: SearchItemType | Post, type: string): string {
  switch (type) {
    case 'user':
      return `/${(item as AuthorInfo).username}`;
    case 'post':
      const post = item as Post;
      return `/${post.author.username}/posts/${post.id}`;
    case 'project':
      return `/projects/${(item as Project).id}`;
    case 'experience':
      return `/experiences/${(item as UserExperience).id}`;
    default:
      return '/';
  }
}

export function getBlurDataURL() {
  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 8 5">
      <filter id="b" color-interpolation-filters="sRGB">
        <feGaussianBlur stdDeviation="1" />
      </filter>
      <rect preserveAspectRatio="none" filter="url(#b)" x="0" y="0" height="100%" width="100%" fill="#777"/>
    </svg>
  `
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/'/g, '%27');
}

export function formatDate(month: Month, year: number | string) {
  try {
    const monthIndex = Object.values(Month).indexOf(month);
    const date = new Date(Number(year), monthIndex);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
    });
  } catch (error) {
    return 'Invalid date';
  }
}
