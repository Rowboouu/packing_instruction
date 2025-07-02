import { useSearchParams } from 'react-router-dom';
import { z } from 'zod';

import { filterKeySchema } from '@/lib/validations/filter';

type FilterKeyType = z.infer<typeof filterKeySchema>;

export const useTypedSearchParams = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const params: FilterKeyType = filterKeySchema.parse(
    Object.fromEntries(
      Array.from(searchParams.entries()).map(([key, value]) => {
        if (filterKeySchema.shape[key as keyof typeof filterKeySchema.shape]) {
          const parsedValue =
            filterKeySchema.shape[
              key as keyof typeof filterKeySchema.shape
            ].safeParse(value);
          return [key, parsedValue.success ? parsedValue.data : null];
        }
        return [key, value];
      }),
    ),
  );

  function setParams(params: Partial<FilterKeyType>) {
    Object.entries(params).forEach(([key, value]) => {
      if (!value) {
        searchParams.delete(key as keyof FilterKeyType);
      } else {
        searchParams.set(key as keyof FilterKeyType, String(value));
      }
    });
    setSearchParams(searchParams);
  }

  return { params, setParams };
};
