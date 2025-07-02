import { cn } from '@/lib/utils';
import React, { Ref, forwardRef, useState } from 'react';
import { useOnClickOutside } from 'usehooks-ts';

type EditableFieldProps = React.InputHTMLAttributes<HTMLInputElement> & {
  unit?: string;
  onBlurField?: () => void;
  isParse?: boolean;
};

export const EditableField = forwardRef<HTMLInputElement, EditableFieldProps>(
  (
    { unit, isParse, onBlurField, className, ...props }: EditableFieldProps,
    ref: Ref<HTMLInputElement>,
  ) => {
    const [isEditing, setIsEditing] = useState(false);
    const contRef = React.useRef(null);

    useOnClickOutside(contRef, () => {
      if (isEditing) {
        setIsEditing(false);
        onBlurField?.();
      }
    });

    const handleDoubleClick = () => {
      setIsEditing(true);
    };

    return (
      <div
        ref={contRef}
        style={{
          display: 'flex',
          height: '20px',
          minWidth: '10px',
          maxWidth: '200px',
          gap: '5px',
          whiteSpace: 'nowrap',
        }}
        onClick={handleDoubleClick}
      >
        {isEditing ? (
          <input
            ref={ref}
            {...props}
            className={cn('form-control border border-primary', className)}
            style={{ paddingLeft: '5px' }}
            autoFocus
          />
        ) : (
          <>
            {isParse ? (
              <span className="text-pdf pdf-focus-edit">
                {parseFloat(String(props.value || '0')).toFixed(2)}
              </span>
            ) : (
              <span className="text-pdf pdf-focus-edit">
                {props.value || '0'}
              </span>
            )}
          </>
        )}
      </div>
    );
  },
);
