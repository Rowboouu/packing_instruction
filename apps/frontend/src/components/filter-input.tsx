import React from 'react';

import { Input } from '@/components/ui/input';
import { useTypedSearchParams } from '@/hooks/useTypedSearchParams';

interface FilterInputProps extends React.ComponentProps<typeof Input> {}

export function FilterInput({ ...props }: FilterInputProps) {
  const { params, setParams } = useTypedSearchParams();

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setParams({ keyword: value });
  };

  return (
    <Input
      {...props}
      type="search"
      value={params.keyword}
      onChange={handleChange}
      leftIcon="FiSearch"
    />
  );
}
