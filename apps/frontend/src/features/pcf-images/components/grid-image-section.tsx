import React, { useState } from 'react';
import { Icons } from '@/components/icons';
import { Card, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import useDropzoneHandler from '@/hooks/useDropzoneHandler';
import { useTranslation } from 'react-i18next';
import { PCFImageItem } from './pcf-image-item';
import { PcfImage } from '..';
import { isOdooImage } from '../routes/pcf-images-page';

interface GridImageItem {
  id: string;
  file?: File;
  pcfImage?: PcfImage;
  label: string;
  isUploadSlot?: boolean;
  isRequired?: boolean;
  placeholder?: string;
  base64Data?: string;
  // Staging flags
  isMarkedForDeletion?: boolean;
  replacementFile?: File;
  // ✅ ENHANCED: Add shipping mark and category support
  shippingMarkType?: 'inner' | 'main' | 'side';
  category?: string;
}

interface GridImageSectionProps {
  assortmentId?: string;
  items: GridImageItem[];
  onItemsChange: (items: GridImageItem[]) => void;
  sectionType?: string;
  onStageForDelete?: (filename: string) => void;
  onStageForReplace?: (filename: string, newFile: File) => void;
  requiredInputs?: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
  }[];
  jsonData?: any;
  sectionId?: string;
  onCrossSectionTransfer?: (
    fromSectionId: string,
    toSectionId: string,
    item: GridImageItem,
    targetIndex: number
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
  onStageForDelete?: (filename: string) => void;
  onStageForReplace?: (filename: string, newFile: File) => void;
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
  onStageForDelete,
  onStageForReplace,
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

  const isFromOdoo = isOdooImage(item);

  const displayItem = item.replacementFile || item.file || item.pcfImage;

  const { getRootProps, getInputProps } = useDropzoneHandler({
    selectedFiles: (files) => onFileChange(files[0]),
    options: { multiple: false },
  });

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData(
      'text/plain',
      JSON.stringify({
        item,
        sourceIndex: index,
        sourceSectionId: sectionId,
      })
    );
    onDragStart(index, item);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const mouseX = e.clientX;
    const insertAfter = mouseX > centerX;
    const targetIndex = insertAfter ? index + 1 : index;
    onDragOver(targetIndex);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const mouseX = e.clientX;
    const insertAfter = mouseX > centerX;
    const targetIndex = insertAfter ? index + 1 : index;
    onDrop(e, targetIndex);
    onDragEnd();
  };

  // Enhanced replace handler
  const handleReplaceFile = (newFile: File) => {
    if (item.pcfImage?.filename && onStageForReplace) {
      onStageForReplace(item.pcfImage.filename, newFile);
    } else {
      // For new files, just replace directly
      onFileChange(newFile);
    }
  };

  if (item.isUploadSlot && !displayItem) {
    return (
      <Card
        style={{ height: '200px', width: '220px' }}
        className={`border-2 border-dashed transition-all duration-200 hover:scale-105 ${
          item.isRequired 
            ? 'border-red-300 hover:border-red-400 bg-red-50 hover:bg-red-100' 
            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
        } cursor-pointer ${
          isDragging ? 'opacity-50 scale-95' : 'opacity-100'
        } ${isDragOver ? 'border-blue-400 bg-blue-50' : ''}`}
        draggable
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        {...getRootProps()}
      >
        <input {...getInputProps()} />
        <div className="h-full w-full flex flex-col justify-center items-center">
          {/* ✅ REQUIRED ICON: Different icon for required fields */}
          {item.isRequired ? (
            <Icons.Plus height={24} width={24} className="text-red-500 mb-2" />
          ) : (
            <Icons.Plus height={24} width={24} className="text-gray-400 mb-2" />
          )}
          <span className={`text-sm text-center px-2 ${
            item.isRequired ? 'text-red-600 font-medium' : 'text-gray-500'
          }`}>
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
      } ${isDragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-200'}
      ${item.isMarkedForDeletion ? 'border-red-500 bg-red-50' : ''}
      ${item.replacementFile ? 'border-orange-500 bg-orange-50' : ''}`}
      draggable
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {displayItem ? (
        <div className="flex-1 relative overflow-hidden flex items-center justify-center">
          {/* Staging overlays */}
          {item.isMarkedForDeletion && (
            <div className="absolute inset-0 bg-red-500 bg-opacity-20 flex items-center justify-center z-10">
              <div className="bg-red-600 text-white px-2 py-1 rounded text-xs font-medium">
                MARKED FOR DELETION
              </div>
            </div>
          )}
          {item.replacementFile && (
            <div className="absolute inset-0 bg-orange-500/30 flex items-center justify-center z-10">
              <div className="bg-orange-600 text-white px-2 py-1 rounded text-xs font-medium">
                REPLACEMENT STAGED
              </div>
            </div>
          )}
          
          {/* ✅ FIXED: Render replacement file preview or original */}
          {item.replacementFile ? (
            // Show preview of replacement file
            <img
              src={URL.createObjectURL(item.replacementFile)}
              alt={`Replacement for ${item.label}`}
              style={{
                maxWidth: '100%',
                height: 'auto',
                maxHeight: '160px',
                display: 'block',
                margin: 'auto',
                objectFit: 'contain',
              }}
              onError={(e) => {
                console.error('🚨 Replacement image preview failed to load');
                const target = e.target as HTMLImageElement;
                target.style.backgroundColor = '#f3f4f6';
                target.style.border = '2px dashed #d1d5db';
                target.alt = 'Replacement preview failed';
              }}
            />
          ) : (
            // Show original PCFImageItem
            <PCFImageItem
              item={displayItem}
              label={item.label}
              assortmentId={assortmentId}
              onOpenClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'image/*';
                input.onchange = (e) => {
                  const file = (e.target as HTMLInputElement).files?.[0];
                  if (file) {
                    handleReplaceFile(file);
                  }
                };
                input.click();
              }}
              onStageForDelete={onStageForDelete}
              base64Data={item.base64Data}
              hideOptions={isFromOdoo}
            />
          )}
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
        {item.isRequired && (
          <span className="text-red-500 font-bold ml-1 text-sm">*</span>
        )}
      </CardFooter>
    </Card>
  );
}

export function GridImageSection({
  assortmentId,
  items,
  onItemsChange,
  onStageForDelete,
  onStageForReplace,
  requiredInputs = [],
  jsonData,
  sectionId,
  onCrossSectionTransfer,
  acceptCrossSectionTransfers = false,
}: GridImageSectionProps) {
  const { t } = useTranslation();
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // ✅ FIXED: Preserve shipping mark type and category when file is added + trigger dirty state
  const handleFileChange = (index: number, file?: File) => {
    const newItems = [...items];
    const currentItem = newItems[index];
    
    // ✅ CRITICAL FIX: Preserve all original properties, especially shippingMarkType and category
    newItems[index] = { 
      ...currentItem, 
      file,
      // ✅ IMPORTANT: Keep the upload slot properties when file is added
      isUploadSlot: !!file, // ✅ FIXED: Keep as upload slot if file exists (triggers dirty state)
    };
    
    // ✅ DEBUG: Log to verify shipping mark data is preserved
    if (currentItem.shippingMarkType || currentItem.category) {
      console.log(`🚚 File added to shipping mark slot:`, {
        fileName: file?.name,
        shippingMarkType: currentItem.shippingMarkType,
        category: currentItem.category,
        preserved: {
          shippingMarkType: newItems[index].shippingMarkType,
          category: newItems[index].category,
        }
      });
    }
    
    onItemsChange(newItems);
  };

  const handleLabelChange = (index: number, label: string) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], label };
    onItemsChange(newItems);
  };

  // ✅ ENHANCED: Add new slot with proper category detection
  const handleAddNewSlot = (files: File[]) => {
    if (files.length > 0) {
      // ✅ NEW: Try to detect category from existing items in this section
      const sectionCategory = items.find(item => item.category)?.category || 'displayImages';
      
      const newItem: GridImageItem = {
        id: `upload-${Date.now()}`,
        label: '',
        isUploadSlot: false,
        file: files[0],
        category: sectionCategory, // ✅ NEW: Set category for new items
      };
      
      console.log(`📤 Adding new item with category: ${sectionCategory}`);
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
          targetIndex
        );
        return;
      }
      
      if (draggedIndex !== null && draggedIndex !== targetIndex) {
        const newItems = [...items];
        const draggedItem = newItems[draggedIndex];
        newItems.splice(draggedIndex, 1);
        const insertIndex =
          draggedIndex < targetIndex ? targetIndex - 1 : targetIndex;
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

  const { getRootProps: getAddRootProps, getInputProps: getAddInputProps } =
    useDropzoneHandler({
      selectedFiles: handleAddNewSlot,
      options: { multiple: false },
    });

  return (
    <div className="pt-2">
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

      <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6 4xl:grid-cols-7 gap-4 justify-start items-center">
        {items.map((item, index) => (
          <GridImageCard
            key={item.id}
            item={item}
            assortmentId={assortmentId}
            index={index}
            onFileChange={(file) => handleFileChange(index, file)}
            onLabelChange={(label) => handleLabelChange(index, label)}
            onStageForDelete={onStageForDelete}
            onStageForReplace={onStageForReplace}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
            onDrop={handleDrop}
            isDragging={draggedIndex === index}
            isDragOver={dragOverIndex === index}
            sectionId={sectionId}
          />
        ))}

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