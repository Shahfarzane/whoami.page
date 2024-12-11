import React from 'react';
import { Box, DataList, Flex, Heading, Section, Text } from '@radix-ui/themes';
import { ContactMethod, Project, UserExperience } from '@/types/user';
import { ExternalLink } from '../ui/link';
import { TimelineItem, TimelineProvider } from '@/components/timeline';
import { urlPatterns } from '@/app/_lib/schema';
import type { User } from '@/types/user';
import { Month } from '@prisma/client';

interface ProfileProps {
  edit: boolean;
  user: User;
  experience?: UserExperience[];
  projects?: Project[];
  contactMethods?: ContactMethod[];
}

const Profile = React.memo<ProfileProps>(
  ({
    user,
    edit = false,
    experience = [],
    projects = [],
    contactMethods = [],
  }) => {
    const sortByDate = React.useCallback(
      (a: UserExperience | Project, b: UserExperience | Project) => {
        const yearA = Number(a.startYear);
        const yearB = Number(b.startYear);
        if (yearA !== yearB) {
          return yearB - yearA;
        }
        return (
          Object.values(Month).indexOf(b.startMonth) -
          Object.values(Month).indexOf(a.startMonth)
        );
      },
      [],
    );

    const sortedProjects = React.useMemo(
      () => [...projects].sort(sortByDate),
      [projects, sortByDate],
    );

    const sortedExperiences = React.useMemo(
      () => [...experience].sort(sortByDate),
      [experience, sortByDate],
    );

    return (
      <Box px={{ initial: '5', sm: '7' }}>
        {user.description && (
          <Section size="1" py="4">
            <Flex direction="column" gap="4">
              <Heading as="h3" weight="regular" size="4" highContrast>
                {' '}
                About
              </Heading>
              <Text as="p" size="2" color="gray">
                {user.description}
              </Text>
            </Flex>
          </Section>
        )}

        {contactMethods.length > 0 && (
          <Section size="1" py={{ initial: '4', sm: '5' }}>
            <Flex direction="column" gap="4">
              <Heading as="h3" weight="regular" size="4" highContrast>
                {' '}
                Contact Details
              </Heading>
              <DataList.Root
                trim="start"
                orientation={{ initial: 'vertical', sm: 'horizontal' }}
              >
                {contactMethods.map((contact) => (
                  <DataList.Item key={contact.id}>
                    <DataList.Label minWidth="88px">
                      {contact.type.charAt(0) +
                        contact.type.slice(1).toLowerCase()}
                    </DataList.Label>
                    <DataList.Value>
                      <ExternalLink
                        href={`${urlPatterns[contact.type]}${contact.contactUsername}`}
                        externalIcon={true}
                      >
                        {contact.contactUsername}
                      </ExternalLink>
                    </DataList.Value>
                  </DataList.Item>
                ))}
              </DataList.Root>
            </Flex>
          </Section>
        )}

        {sortedProjects.length > 0 && (
          <Section size="1" py={{ initial: '4', sm: '5' }}>
            <Flex direction="column" gap="4">
              <Heading as="h3" weight="regular" size="4" highContrast>
                Projects
              </Heading>
              {sortedProjects.map((project) => (
                <TimelineItem key={project.id} item={project} edit={edit} />
              ))}
            </Flex>
          </Section>
        )}

        {sortedExperiences.length > 0 && (
          <Section size="1" py={{ initial: '4', sm: '5' }}>
            <Flex direction="column" gap="4">
              <Heading as="h3" weight="regular" size="4" highContrast>
                {' '}
                Work Experience
              </Heading>
              <TimelineProvider>
                {sortedExperiences.map((exp) => (
                  <TimelineItem key={exp.id} item={exp} edit={edit} />
                ))}
              </TimelineProvider>
            </Flex>
          </Section>
        )}
      </Box>
    );
  },
);

Profile.displayName = 'Profile';

export default Profile;
