import React from 'react';
import { Command } from 'cmdk';
import { SearchUser, SearchItem } from '@/types/search';
import { PostComponentProps } from '@/types';
import { Project, UserExperience } from '@/types/user';
import { getItemLink } from '@/lib/utils';
import { Flex, Avatar, Text } from '@radix-ui/themes';

interface SearchResultItemProps {
  item: SearchItem;
  onItemClick: () => void;
}

const SearchResultItem: React.FC<SearchResultItemProps> = React.memo(
  ({ item, onItemClick }) => {
    const getResultType = (): string => {
      if ('username' in item) return 'User';
      if ('text' in item) return 'Post';
      if ('client' in item) return 'Project';
      if ('company' in item) return 'Experience';
      console.warn('⚠️ Unknown result type:', item);
      return 'Unknown';
    };

    console.log(' Rendering search result item:', {
      type: getResultType(),
      id: 'id' in item ? item.id : 'unknown',
    });

    const getResultTitle = (): string => {
      if ('username' in item)
        return (item as SearchUser).fullName || 'Unknown User';
      if ('text' in item)
        return (item as PostComponentProps).text.slice(0, 50) + '...';
      if ('title' in item) return item.title;
      return 'Unknown';
    };

    const getResultSubtitle = (): string => {
      if ('username' in item) {
        const user = item as SearchUser & { jobTitle?: string };
        return user.jobTitle || '';
      }
      if ('text' in item) {
        const post = item as PostComponentProps;
        return `By ${post.author.fullName || post.author.username}`;
      }
      if ('client' in item) {
        const project = item as Project;
        return project.client || project.description || '';
      }
      if ('company' in item) {
        const experience = item as UserExperience;
        return experience.company || '';
      }
      return '';
    };

    const getResultImage = (): string | undefined => {
      if ('profileImage' in item)
        return (item as SearchUser).profileImage || undefined;
      if ('images' in item) {
        const images = (item as PostComponentProps | Project | UserExperience)
          .images;
        return images && images.length > 0 ? images[0] : undefined;
      }
      return undefined;
    };

    const image = getResultImage();
    const subtitle = getResultSubtitle();

    return (
      <Command.Item
        className="w-full"
        value={getResultTitle()}
        onSelect={() => {
          console.log('🖱️ Search result selected:', {
            type: getResultType(),
            title: getResultTitle(),
          });
          onItemClick();
          window.location.href = getItemLink(
            item,
            getResultType().toLowerCase() as any,
          );
        }}
      >
        <Flex gap="3" align="center" className="w-full">
          {image && (
            <Avatar
              src={image}
              fallback={getResultTitle().charAt(0)}
              size="2"
              radius="full"
            />
          )}
          <Flex direction="column" className="flex-grow">
            <Text size="2">{getResultTitle()}</Text>
            {subtitle && (
              <Text size="1" color="gray">
                {subtitle}
              </Text>
            )}
          </Flex>
          <Text size="1" color="gray">
            {getResultType()}
          </Text>
        </Flex>
      </Command.Item>
    );
  },
);

SearchResultItem.displayName = 'SearchResultItem';

export default SearchResultItem;
