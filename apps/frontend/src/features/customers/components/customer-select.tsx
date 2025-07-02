import AsyncSelect from 'react-select/async';
import { fetchZuluCustomers } from '..';

interface Option {
  label: string;
  value: number;
}

interface CustomerSelectProps {
  onChange?: (selectedOption: Option | null) => void;
  value?: Option | null;
}

export function CustomerSelect({ value, onChange }: CustomerSelectProps) {
  let timeoutId: NodeJS.Timeout;

  const loadOptions = (inputValue: string): Promise<Option[]> => {
    return new Promise<Option[]>((resolve) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(async () => {
        const newReq = await fetchZuluCustomers({ keyword: inputValue });
        const options = newReq.items.map(({ id, name }) => {
          return { value: id, label: name };
        });
        resolve(options);
      }, 500);
    });
  };

  const selectedValue = value && value?.value > 0 ? value : null;
  return (
    <>
      <AsyncSelect
        isClearable
        cacheOptions
        defaultOptions
        loadOptions={loadOptions}
        placeholder="Select customer..."
        value={selectedValue}
        onChange={(selectedOption) => {
          // setFilter('');
          onChange?.(selectedOption as Option);
        }}
      />
    </>
  );
}
