import React from 'react';
import { Flex, Text, Button, Grid, Box } from '@radix-ui/themes';
import Image from 'next/image';
import { formatEnumString, formatContactMethodType } from '@/lib/utils';
import SettingsDeleteItem from '@/components/settings/settings-delete-item';

interface BaseItem {
  id: string;
  [key: string]: any;
}

interface ContactMethod extends BaseItem {
  type: string;
  contactUsername: string;
}

interface DateRangeItem extends BaseItem {
  startMonth: string;
  startYear: string;
  endMonth?: string | null;
  endYear?: string | null;
  title?: string;
  description?: string | null;
}

interface Project extends DateRangeItem {
  images?: string[] | null;
}

interface UserExperience extends DateRangeItem {}

type ItemType = Project | UserExperience | ContactMethod;

interface SettingsItemProps {
  item: ItemType;
  edit: boolean;
  config: {
    itemType: string;
  };
  onEdit: (id: string) => void;
  onDelete: (id: string) => Promise<void>;
}

const SettingsListItem: React.FC<SettingsItemProps> = ({
  item,
  edit,
  config,
  onEdit,
  onDelete,
}) => {
  const formatDate = (
    startMonth: string,
    startYear: string,
    endMonth?: string | null,
    endYear?: string | null,
  ) => {
    const start = `${formatEnumString(startMonth)} ${startYear}`;
    const end =
      endMonth && endYear
        ? `${formatEnumString(endMonth)} ${endYear}`
        : 'Present';
    return `${start} - ${end}`;
  };

  const isContactMethod = 'contactUsername' in item;
  const isProject = 'images' in item && item.images && item.images.length > 0;

  return (
    <div>
      <Grid columns="3" gap="3">
        {isContactMethod ? (
          <Flex direction="column" style={{ gridColumn: 'span 1' }}>
            <Text size="2">{formatContactMethodType(item.type)}</Text>
            <Text size="2" color="gray">
              {item.contactUsername}
            </Text>
          </Flex>
        ) : (
          <Flex direction="column" style={{ gridColumn: 'span 1' }}>
            <Text size="1" color="gray" as="span">
              {'startMonth' in item && 'startYear' in item
                ? formatDate(
                    item.startMonth,
                    item.startYear,
                    item.endMonth,
                    item.endYear,
                  )
                : ''}
            </Text>
          </Flex>
        )}
        <Flex direction="column" gap="2" style={{ gridColumn: 'span 2' }}>
          <Text size="2" highContrast weight="medium">
            {isContactMethod
              ? ''
              : ('title' in item && item.title) ||
                ('type' in item && item.type) ||
                ''}
          </Text>
          {!isContactMethod && (
            <Text as="p" color="gray" size="2">
              {('description' in item && item.description) || ''}
            </Text>
          )}
          {isProject && (
            <Box
              style={{
                width: '100%',
                maxWidth: '300px',
                aspectRatio: '16 / 9',
                position: 'relative',
                overflow: 'hidden',
                borderRadius: '8px',
              }}
            >
              <Image
                src={item.images[0]}
                alt={`First image for ${item.title || config.itemType}`}
                fill
                style={{ objectFit: 'contain' }}
              />
            </Box>
          )}
          {edit && (
            <Flex gap="3" mt="2" align="center">
              <Button onClick={() => onEdit(item.id)} variant="ghost" size="1">
                Edit
              </Button>
              <SettingsDeleteItem
                id={item.id}
                itemName={config.itemType}
                deleteAction={() => onDelete(item.id)}
                invalidateQueryKey="userData"
                successMessage={`${config.itemType} deleted successfully`}
                errorMessage={`Failed to delete ${config.itemType}`}
              />
            </Flex>
          )}
        </Flex>
      </Grid>
    </div>
  );
};

export default SettingsListItem;
