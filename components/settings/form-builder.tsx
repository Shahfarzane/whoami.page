import { forwardRef, useImperativeHandle, useEffect, useState } from 'react';
import { useForm, SubmitHandler, useWatch } from 'react-hook-form';
import { Flex } from '@radix-ui/themes';
import FormFields from '@/components/settings/form-fields';
import { SettingsFormField } from '@/types/settings';

interface FormBuilderProps<T extends Record<string, any>> {
  fields: SettingsFormField[];
  defaultValues?: T;
  onSave: (data: T) => void;
  onFieldChange?: (name: string, value: any) => void;
  fullWidth?: boolean;
}

export interface FormHandle {
  submit: () => void;
  reset: () => void;
}

const FormBuilder = forwardRef<FormHandle, FormBuilderProps<any>>(
  (props, ref) => {
    const {
      fields,
      defaultValues,
      onSave,
      onFieldChange,
      fullWidth = false,
    } = props;
    const {
      control,
      handleSubmit,
      formState: { errors },
      reset,
      setValue,
    } = useForm({ defaultValues, mode: 'onChange' });

    useEffect(() => {
      if (defaultValues) {
        Object.entries(defaultValues).forEach(([key, value]) => {
          setValue(key, value);
        });
      }
    }, [defaultValues, setValue]);

    const watchedFields = useWatch({ control });

    useEffect(() => {
      if (onFieldChange) {
        Object.entries(watchedFields).forEach(([name, value]) => {
          onFieldChange(name, value);
        });
      }
    }, [watchedFields, onFieldChange]);

    const onSubmit: SubmitHandler<Record<string, any>> = async (data) => {
      const processedData = Object.entries(data).reduce(
        (acc, [key, value]) => {
          if (
            (key.includes('Year') ||
              key === 'startYear' ||
              key === 'endYear' ||
              key.includes('Month')) &&
            value !== undefined
          ) {
            acc[key] = value === '_empty_' ? null : value;
          } else {
            acc[key] = value;
          }
          return acc;
        },
        {} as Record<string, any>,
      );

      await onSave(processedData);
    };

    useImperativeHandle(ref, () => ({
      submit: handleSubmit(onSubmit),
      reset: () => {
        reset(defaultValues);
      },
    }));

    const [selectOpenStates, setSelectOpenStates] = useState<
      Record<string, boolean>
    >({});

    const onSelectOpenChange = (fieldName: string, isOpen: boolean) => {
      setSelectOpenStates((prev) => ({ ...prev, [fieldName]: isOpen }));
    };

    return (
      <form onSubmit={handleSubmit(onSubmit)} className="mt-3 w-full">
        <Flex direction="column" gap="3">
          <FormFields
            fields={fields}
            errors={errors}
            control={control}
            setValue={setValue}
            fullWidth={fullWidth}
            selectOpenStates={selectOpenStates}
            onSelectOpenChange={onSelectOpenChange}
          />
        </Flex>
      </form>
    );
  },
);

FormBuilder.displayName = 'FormBuilder';
export default FormBuilder;
