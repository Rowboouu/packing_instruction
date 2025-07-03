import React, { useState } from 'react';
import { Icons } from '@/components/icons';
import { Card, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import useDropzoneHandler from '@/hooks/useDropzoneHandler';
import { groupPCFImages } from '@/utils/pcf-util';
import { useTranslation } from 'react-i18next';
import { PCFImageItem } from './pcf-image-item';
import { PcfImage } from '..';

interface GridImageItem {
  id: string;
  file?: File;
  pcfImage?: PcfImage;
  label: string;
  isUploadSlot?: boolean;
  isRequired?: boolean;
  placeholder?: string;
}

interface GridImageSectionProps {
  assortmentId?: string;
  items: GridImageItem[];
  onItemsChange: (items: GridImageItem[]) => void;
  groupPcfImages?: ReturnType<typeof groupPCFImages>;
  requiredInputs?: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
  }[];
  jsonData?: any; // This will be the JSON input data
  sectionId?: string; // For cross-section transfers
  onCrossSectionTransfer?: (
    fromSectionId: string,
    toSectionId: string,
    item: GridImageItem,
    targetIndex: number,
  ) => void;
  acceptCrossSectionTransfers?: boolean;
}

interface EditableLabelProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

function EditableLabel({ value, onChange, className }: EditableLabelProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value);

  const handleSave = () => {
    onChange(tempValue);
    setIsEditing(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setTempValue(value);
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <Input
        value={tempValue}
        onChange={(e) => setTempValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyPress}
        className="text-sm text-center border-0 p-0 h-auto bg-transparent"
        autoFocus
      />
    );
  }

  return (
    <span
      className={`text-sm truncate cursor-pointer hover:bg-gray-100 px-1 rounded ${className}`}
      onClick={() => setIsEditing(true)}
      title="Click to edit"
    >
      {value || 'Click to add label'}
    </span>
  );
}

interface GridImageCardProps {
  item: GridImageItem;
  assortmentId?: string;
  onFileChange: (file?: File) => void;
  onLabelChange: (label: string) => void;
  onDelete?: () => void;
  index: number;
  onDragStart: (index: number, item: GridImageItem) => void;
  onDragOver: (index: number) => void;
  onDragEnd: () => void;
  onDrop: (e: React.DragEvent, targetIndex: number) => void;
  isDragging?: boolean;
  isDragOver?: boolean;
  sectionId?: string;
}

function GridImageCard({
  item,
  assortmentId,
  onFileChange,
  onLabelChange,
  onDelete,
  index,
  onDragStart,
  onDragOver,
  onDragEnd,
  onDrop,
  isDragging,
  isDragOver,
  sectionId,
}: GridImageCardProps) {
  const { t } = useTranslation();
  const displayItem = item.file || item.pcfImage;

  const { getRootProps, getInputProps, open } = useDropzoneHandler({
    selectedFiles: (files) => onFileChange(files[0]),
    options: { multiple: false },
  });

  const handleDelete = () => {
    if (item.file) {
      onFileChange(undefined);
    } else if (onDelete) {
      onDelete();
    }
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData(
      'text/plain',
      JSON.stringify({
        item,
        sourceIndex: index,
        sourceSectionId: sectionId,
      }),
    );
    onDragStart(index, item);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';

    // Get the current mouse position relative to the card
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const mouseX = e.clientX;

    // Determine if we should insert before or after based on mouse position
    const insertAfter = mouseX > centerX;
    const targetIndex = insertAfter ? index + 1 : index;

    onDragOver(targetIndex);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();

    // Get the current mouse position relative to the card
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const mouseX = e.clientX;

    // Determine if we should insert before or after based on mouse position
    const insertAfter = mouseX > centerX;
    const targetIndex = insertAfter ? index + 1 : index;

    onDrop(e, targetIndex);
    onDragEnd();
  };

  if (item.isUploadSlot && !displayItem) {
    return (
      <Card
        style={{ height: '200px', width: '220px' }}
        className={`border-2 border-dashed border-gray-300 hover:border-gray-400 cursor-pointer transition-all duration-200 ${
          isDragging ? 'opacity-50 scale-95' : 'opacity-100 hover:scale-105'
        } ${isDragOver ? 'border-blue-400 bg-blue-50' : ''}`}
        draggable
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        {...getRootProps()}
      >
        <input {...getInputProps()} />
        <div className="h-full w-full flex flex-col justify-center items-center">
          <Icons.Plus height={24} width={24} className="text-gray-400 mb-2" />
          <span className="text-sm text-gray-500 text-center px-2">
            {item.placeholder || t('keyText_newImage')}
          </span>
        </div>
      </Card>
    );
  }

  return (
    <Card
      style={{ height: '200px', width: '220px' }}
      className={`flex flex-col overflow-hidden transition-all duration-200 hover:shadow-lg ${
        isDragging ? 'opacity-50 scale-95' : 'opacity-100 hover:scale-105'
      } ${isDragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-200'}`}
      draggable
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {displayItem ? (
        <div className="flex-1 relative overflow-hidden flex items-center justify-center">
          <PCFImageItem
            item={displayItem}
            label={item.label}
            assortmentId={assortmentId}
            onOpenClick={open}
            onDeleteClick={handleDelete}
          />
        </div>
      ) : (
        <div
          {...getRootProps({
            className: 'flex-1 flex items-center justify-center cursor-pointer',
          })}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center justify-center">
            <Icons.Plus height={14} width={14} />
            <span className="ml-2 text-sm">{t('keyText_newImage')}</span>
          </div>
        </div>
      )}
      <CardFooter className="p-2 flex flex-col text-center text-gray-600 h-auto shrink-0">
        <EditableLabel
          value={item.label}
          onChange={onLabelChange}
          className="w-full"
        />
      </CardFooter>
    </Card>
  );
}

export function GridImageSection({
  assortmentId,
  items,
  onItemsChange,
  requiredInputs = [],
  jsonData,
  sectionId,
  onCrossSectionTransfer,
  acceptCrossSectionTransfers = false,
}: GridImageSectionProps) {
  const { t } = useTranslation();
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleFileChange = (index: number, file?: File) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], file };
    onItemsChange(newItems);
  };

  const handleLabelChange = (index: number, label: string) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], label };
    onItemsChange(newItems);
  };

  const handleAddNewSlot = (files: File[]) => {
    if (files.length > 0) {
      const newItem: GridImageItem = {
        id: `upload-${Date.now()}`,
        label: '',
        isUploadSlot: false,
        file: files[0],
      };
      onItemsChange([...items, newItem]);
    }
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (targetIndex: number) => {
    if (draggedIndex !== null && draggedIndex !== targetIndex) {
      setDragOverIndex(targetIndex);
    }
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    try {
      const dragData = JSON.parse(e.dataTransfer.getData('text/plain'));
      const { item: droppedItem, sourceSectionId } = dragData;

      // Cross-section transfer
      if (
        sourceSectionId &&
        sourceSectionId !== sectionId &&
        onCrossSectionTransfer &&
        acceptCrossSectionTransfers
      ) {
        onCrossSectionTransfer(
          sourceSectionId,
          sectionId!,
          droppedItem,
          targetIndex,
        );
        return;
      }

      // Same section reordering
      if (draggedIndex !== null && draggedIndex !== targetIndex) {
        const newItems = [...items];
        const draggedItem = newItems[draggedIndex];

        // Remove the dragged item
        newItems.splice(draggedIndex, 1);

        // Adjust target index if dragging from earlier position
        const insertIndex =
          draggedIndex < targetIndex ? targetIndex - 1 : targetIndex;

        // Insert at new position
        newItems.splice(insertIndex, 0, draggedItem);

        onItemsChange(newItems);
      }
    } catch (error) {
      console.error('Error parsing drag data:', error);
    }
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // Dropzone handler for the "Add New Image" button
  const { getRootProps: getAddRootProps, getInputProps: getAddInputProps } =
    useDropzoneHandler({
      selectedFiles: handleAddNewSlot,
      options: { multiple: false },
    });

  return (
    <div className="pt-2">
      {/* Required Inputs Section */}
      {requiredInputs.length > 0 && (
        <div className="mb-6 space-y-4">
          {requiredInputs.map((input, index) => (
            <div key={index} className="flex flex-col space-y-2">
              <Label className="text-sm font-medium">{input.label}</Label>
              <Input
                value={input.value}
                onChange={(e) => input.onChange(e.target.value)}
                placeholder={input.placeholder}
                className="max-w-md"
              />
            </div>
          ))}
        </div>
      )}

      {/* Images Grid - Left Aligned */}
      <div className="grid grid-cols-8 gap-4 justify-start items-center">
        {items.map((item, index) => (
          <GridImageCard
            key={item.id}
            item={item}
            assortmentId={assortmentId}
            index={index}
            onFileChange={(file) => handleFileChange(index, file)}
            onLabelChange={(label) => handleLabelChange(index, label)}
            onDelete={() => {
              const newItems = items.filter((_, i) => i !== index);
              onItemsChange(newItems);
            }}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
            onDrop={handleDrop}
            isDragging={draggedIndex === index}
            isDragOver={dragOverIndex === index}
            sectionId={sectionId}
          />
        ))}

        {/* Add New Image Button */}
        <Card
          style={{ height: '200px', width: '220px' }}
          className="border-2 border-dashed border-gray-300 hover:border-gray-400 cursor-pointer flex items-center justify-center transition-all duration-200 hover:scale-105 hover:shadow-md hover:bg-gray-50"
          {...getAddRootProps()}
        >
          <input {...getAddInputProps()} />
          <div className="text-center">
            <Icons.Plus
              height={24}
              width={24}
              className="text-gray-400 mx-auto mb-2"
            />
            <span className="text-sm text-gray-500">
              {t('keyText_newImage')}
            </span>
          </div>
        </Card>
      </div>

      {/* JSON Data Display (for debugging) */}
      {jsonData && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <h4 className="text-sm font-medium mb-2">JSON Data:</h4>
          <pre className="text-xs overflow-auto">
            {JSON.stringify(jsonData, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
