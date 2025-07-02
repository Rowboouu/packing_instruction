import React from 'react';

import { SelectInput } from '@/components/select-input';
import { useGetTemplates } from '@/features/templates';

export function TemplateSelect(
  props: React.ComponentProps<typeof SelectInput>,
) {
  const { data, isLoading } = useGetTemplates();
  return (
    <>
      <SelectInput
        placeholder="Select a template"
        {...props}
        isLoading={isLoading}
        options={data?.map((temp) => ({
          value: temp._id,
          label: temp.name,
        }))}
      />
    </>
  );
}
