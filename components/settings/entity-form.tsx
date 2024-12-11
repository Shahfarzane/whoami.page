import React, {
  FC,
  useImperativeHandle,
  useRef,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import FormBuilder, { FormHandle } from '@/components/settings/form-builder';
import MediaUploader from '@/components/settings/media-uploader';
import { useFormMutation } from '@/hooks/useFormMutation';
import { Callout } from '@radix-ui/themes';
import {
  SettingsFormField,
  Project,
  Experience,
  ContactMethod,
} from '@/types/settings';

interface EntityFormProps {
  id?: string;
  defaultValues?: Partial<Project | Experience | ContactMethod>;
  onSave: (data: Project | Experience | ContactMethod) => void;
  formRef: React.RefObject<FormHandle>;
  setIsEditing: (editing: boolean) => void;
  fields: SettingsFormField[];
  createAction: (formData: FormData) => Promise<any>;
  updateAction: (formData: FormData) => Promise<any>;
  removeImageAction: (formData: FormData) => Promise<void>;
  queryKey: string[];
  successMessage: string;
  errorMessage: string;
  itemType: string;
}

const EntityForm: FC<EntityFormProps> = ({
  id,
  defaultValues,
  onSave,
  formRef,
  setIsEditing,
  fields,
  createAction,
  updateAction,
  removeImageAction,
  queryKey,
  successMessage,
  errorMessage,
  itemType,
}) => {
  const [formattedValues, setFormattedValues] = useState<Partial<any> | null>(
    null,
  );
  const [images, setImages] = useState<string[]>([]);
  const formSubmitRef = useRef<FormHandle>(null);

  const mutation = useFormMutation(
    useCallback(
      (data: FormData) => (id ? updateAction(data) : createAction(data)),
      [id, updateAction, createAction],
    ),
    queryKey,
    successMessage,
    errorMessage,
    useCallback(
      (oldData, newData) => {
        if (!oldData || !oldData[itemType]) {
          return { ...oldData, [itemType]: [newData] };
        }
        const items = oldData[itemType] || [];
        const updatedItems = id
          ? items.map((item: any) =>
              item.id === id ? { ...item, ...newData } : item,
            )
          : [...items, newData];
        return { ...oldData, [itemType]: updatedItems };
      },
      [id, itemType],
    ),
  );

  useEffect(() => {
    if (defaultValues) {
      const formatted = {
        ...defaultValues,
        ...('startYear' in defaultValues && {
          startYear: defaultValues.startYear?.toString(),
        }),
        ...('endYear' in defaultValues && {
          endYear: defaultValues.endYear?.toString() || null,
        }),
      };
      setFormattedValues(formatted);
      setImages('images' in defaultValues ? defaultValues.images || [] : []);
    } else {
      setFormattedValues({});
      setImages([]);
    }
  }, [defaultValues]);

  const handleSave = useCallback(
    async (data: Partial<any>) => {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formData.append(key, value.toString());
        }
      });

      images.forEach((image, index) => {
        formData.append(`images[${index}]`, image);
      });

      if (id) formData.append('id', id);

      mutation.mutate(formData, {
        onSuccess: (result) => {
          onSave({ ...result, images });
          setIsEditing(false);
        },
      });
    },
    [id, images, mutation, onSave, setIsEditing],
  );

  const handleImageChange = useCallback(
    async (newImages: string[]) => {
      const removedImages = images.filter((img) => !newImages.includes(img));

      for (const imageUrl of removedImages) {
        if (id) {
          const formData = new FormData();
          formData.append(`${itemType.slice(0, -1)}Id`, id);
          formData.append('imageUrl', imageUrl);
          try {
            await removeImageAction(formData);
          } catch (error) {
            // No console.error here as per the code block
          }
        }
      }

      setImages(newImages);
    },
    [id, images, itemType, removeImageAction],
  );

  useImperativeHandle(
    formRef,
    () => ({
      submit: () => {
        formSubmitRef.current?.submit();
      },
      reset: () => {
        formSubmitRef.current?.reset();
        setFormattedValues(
          defaultValues as Partial<Project | Experience | ContactMethod>,
        );
        if (
          itemType !== 'contactMethods' &&
          defaultValues &&
          'images' in defaultValues
        ) {
          setImages(defaultValues.images || []);
        }
      },
    }),
    [defaultValues, itemType],
  );

  const getEndpoint = useMemo(
    () =>
      (itemType: string): 'projectImage' | 'experienceImage' | 'postImage' => {
        switch (itemType) {
          case 'projects':
            return 'projectImage';
          case 'experiences':
            return 'experienceImage';
          case 'posts':
            return 'postImage';
          default:
            throw new Error(`Invalid itemType: ${itemType}`);
        }
      },
    [],
  );

  if (!formattedValues) {
    return null;
  }

  return (
    <>
      {mutation.isError && (
        <Callout.Root color="red" className="mb-4">
          <Callout.Text>{mutation.error?.message || errorMessage}</Callout.Text>
        </Callout.Root>
      )}
      <FormBuilder
        fields={fields}
        defaultValues={formattedValues}
        onSave={handleSave}
        ref={formSubmitRef}
      />
      {itemType !== 'contactMethods' && (
        <MediaUploader
          initialImages={images}
          onImagesChange={handleImageChange}
          maxImages={5}
          endpoint={getEndpoint(itemType)}
          label={`${itemType} Images`}
        />
      )}
    </>
  );
};

export default EntityForm;
