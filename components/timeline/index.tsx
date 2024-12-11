import React, { ReactNode } from 'react';
import { ExternalLink } from '@/components/ui/link';
import { Box, Flex, Separator, Text } from '@radix-ui/themes';
import { Month } from '@prisma/client';
import ImageCard from '@/components/timeline/image-card';
import { formatDate } from '@/lib/utils';
import { Project, UserExperience } from '@/types/user';

interface TimelineProviderProps {
  children: ReactNode[];
}

interface TimelineItemProps {
  item: Project | UserExperience;
  edit: boolean;
}

const TimelineProvider: React.FC<TimelineProviderProps> = ({ children }) => {
  return (
    <Box position="relative">
      <Box position="absolute" left="0" top="0" bottom="0" width="1px">
        <Separator
          size="4"
          orientation="vertical"
          style={{
            height: '100%',
            background:
              'linear-gradient(to bottom, var(--gray-7) 90%, transparent)',
          }}
        />
      </Box>
      <Box className="space-y-8">{children}</Box>
    </Box>
  );
};

const TimelineDot = () => (
  <Box
    width="8px"
    height="8px"
    position="absolute"
    top="6px"
    left="-4px"
    style={{
      backgroundColor: 'var(--gray-10)',
      borderRadius: '50%',
    }}
  />
);

const ExperienceItem: React.FC<{ item: UserExperience }> = ({ item }) => {
  return (
    <Box pl="6" position="relative">
      <TimelineDot />
      <Flex direction="column" gap="1">
        <Flex gap="2" align="center">
          <Text as="span" size="1" color="gray" weight="light">
            <time>{formatDate(item.startMonth, Number(item.startYear))}</time>
          </Text>
          <Text as="span" size="1" color="gray">
            -
          </Text>
          {item.endMonth && item.endYear ? (
            <Text as="span" size="1" color="gray" weight="light">
              <time>{formatDate(item.endMonth, Number(item.endYear))}</time>
            </Text>
          ) : (
            <Text as="span" size="1" color="gray" weight="light">
              Present
            </Text>
          )}
        </Flex>
        <Flex>
          <Text as="p">
            {item.title}
            <Text as="span" className="mx-1">
              at
            </Text>
          </Text>
          <Text as="div" size="3">
            <ExternalLink
              href={item.url || '#'}
              externalIcon={true}
              className="hover:underline"
            >
              {item.company}
            </ExternalLink>
          </Text>
        </Flex>
        {item.description && (
          <Flex>
            <Text color="gray" as="p" size="2">
              {item.description}
            </Text>
          </Flex>
        )}
        {item.images && item.images.length > 0 && (
          <Flex gap="4">
            {item.images.map((image, index) => (
              <ImageCard key={index} image={image} item={item} index={index} />
            ))}
          </Flex>
        )}
      </Flex>
    </Box>
  );
};
const ProjectItem: React.FC<{ item: Project }> = ({ item }) => {
  return (
    <Flex direction="column" gap="2">
      <ExternalLink
        href={item.url || '#'}
        externalIcon={true}
        className="hover:underline"
      >
        <Text>{item.title}</Text>
      </ExternalLink>
      {/* <Flex align="center">
        {item.startMonth && item.startYear && (
          <Text as="span" size="1" color="gray" weight="light">
            <time>{formatDate(item.startMonth, item.startYear)}</time>
          </Text>
        )}
      </Flex> */}
      {item.images && item.images.length > 0 && (
        <Flex gap="3" my="3">
          {item.images.map((image, index) => (
            <ImageCard key={index} image={image} item={item} index={index} />
          ))}
        </Flex>
      )}
      {item.description && (
        <Text color="gray" as="p" size="2">
          {item.description}
        </Text>
      )}
    </Flex>
  );
};

const TimelineItem: React.FC<TimelineItemProps> = ({ item }) => {
  const isProject = 'client' in item;

  if (isProject) {
    return <ProjectItem item={item as Project} />;
  }
  return <ExperienceItem item={item as UserExperience} />;
};

export { TimelineProvider, TimelineItem };
export type { UserExperience, Project, TimelineItemProps };
