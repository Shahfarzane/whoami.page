import React from 'react';
import { TextArea, Text, TextField, Flex, Select } from '@radix-ui/themes';
import { Control, Controller, UseFormSetValue } from 'react-hook-form';
import { formatEnumString } from '@/lib/utils';

interface Field {
  name: string;
  label: string;
  type: string;
  options?: Array<{ value: string; label: string }>;
  validation?: any;
}

interface FormFieldsProps {
  fields: Field[];
  errors: Record<string, any>;
  control: Control<any>;
  setValue: UseFormSetValue<any>;
  fullWidth?: boolean;
  selectOpenStates: Record<string, boolean>;
  onSelectOpenChange: (fieldName: string, isOpen: boolean) => void;
}

const FormFields: React.FC<FormFieldsProps> = ({
  fields,
  errors,
  control,
  setValue,
  fullWidth = false,
  selectOpenStates,
  onSelectOpenChange,
}) => {
  const getDisplayValue = (value: string, field: Field) => {
    if (value === '_empty_') {
      return 'Present';
    }
    return formatEnumString(value);
  };

  const renderField = (field: Field) => (
    <Controller
      name={field.name}
      control={control}
      rules={field.validation}
      render={({ field: { onChange, value, name } }) => {
        switch (field.type) {
          case 'textarea':
            return (
              <TextArea
                size="2"
                variant="soft"
                className="w-full"
                placeholder={field.label}
                id={name}
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
              />
            );
          case 'select':
            return (
              <Flex gap="2">
                <Flex direction="column" className="w-full">
                  <Select.Root
                    size="2"
                    open={selectOpenStates[name]}
                    onOpenChange={(open) => onSelectOpenChange(name, open)}
                    value={value || ''}
                    onValueChange={(newValue) => {
                      onChange(newValue);
                      setValue(name, newValue as any, { shouldValidate: true });
                    }}
                  >
                    <Select.Trigger
                      className="w-full"
                      variant="soft"
                      placeholder={`Select ${field.label}`}
                    >
                      {value
                        ? getDisplayValue(value, field)
                        : `Select ${field.label}`}
                    </Select.Trigger>
                    <Select.Content>
                      {field.options?.map((option) => (
                        <Select.Item key={option.value} value={option.value}>
                          {formatEnumString(option.label)}
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select.Root>
                </Flex>
              </Flex>
            );
          default:
            return (
              <Flex asChild direction="column" gap="1">
                <Text as="label" size="2" weight="medium">
                  <Text color="gray">{field.label}</Text>
                  <TextField.Root
                    variant="soft"
                    placeholder={field.label}
                    {...field}
                    id={name}
                    type={field.type as any}
                    value={value || ''}
                    onChange={(e) => onChange(e.target.value)}
                  />
                </Text>
              </Flex>
            );
        }
      }}
    />
  );

  const renderFieldWithLabel = (field: Field) => (
    <div className="flex flex-col space-y-2">
      {renderField(field)}
      {errors[field.name] && (
        <Text size="1" color="red">
          {String(errors[field.name]?.message)}
        </Text>
      )}
    </div>
  );

  return (
    <div
      className={`grid gap-4 ${fullWidth ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'}`}
    >
      {fields.map((field, index) => {
        const isMonthField = field.name.toLowerCase().includes('month');
        const nextField = fields[index + 1];
        const isYearField =
          nextField && nextField.name.toLowerCase().includes('year');
        const isTitleField = field.name.toLowerCase() === 'title';

        if (isTitleField) {
          return (
            <div key={field.name} className="col-span-1 sm:col-span-2">
              {renderFieldWithLabel(field)}
            </div>
          );
        } else if (isMonthField && isYearField && nextField) {
          return (
            <div
              key={field.name}
              className={`${fullWidth ? 'col-span-1' : 'col-span-1 sm:col-span-2'}`}
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {renderFieldWithLabel(field)}
                {renderFieldWithLabel(nextField)}
              </div>
            </div>
          );
        } else if (
          !field.name.toLowerCase().includes('year') ||
          index === 0 ||
          !fields[index - 1]?.name.toLowerCase().includes('month')
        ) {
          return (
            <div
              key={field.name}
              className={`${
                field.type === 'textarea' || fullWidth
                  ? 'col-span-1 sm:col-span-2'
                  : ''
              }`}
            >
              {renderFieldWithLabel(field)}
            </div>
          );
        }
        return null;
      })}
    </div>
  );
};

export default FormFields;
