import { ConditionalShell } from '@/components/conditional-shell';
import { DataTable } from '@/components/data-table/data-table';
import { FilterInput } from '@/components/filter-input';
import { ViewStyleButton } from '@/components/view-style-button';
import { useTypedSearchParams } from '@/hooks/useTypedSearchParams';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Icons } from '@/components/icons';
import { PackingInstructionCard } from './packing-instruction-card';
import { packingInstructionTableColumns } from './packing-instruction-table-columns';
import { PackingInstructionTablePagination } from './packing-instruction-table-pagination';
import { SalesOrderData, AssortmentData, AssortmentRowData } from '../types';

interface PackingInstructionDataViewProps {
  salesOrderData: SalesOrderData;
  salesOrderId: string;
}

export function PackingInstructionDataView({
  salesOrderData,
  salesOrderId
}: PackingInstructionDataViewProps) {
  const { t } = useTranslation();
  const { params, setParams } = useTypedSearchParams();

  // Local state for search filtering
  const [searchTerm, setSearchTerm] = React.useState('');

  // Filter assortments based on search term - FIXED to handle AssortmentData structure
  const filteredAssortments = React.useMemo(() => {
    if (!salesOrderData?.assortments) return [];

    return salesOrderData.assortments.filter((assortment: AssortmentData) => {
      // Safely access properties from the AssortmentData structure
      const itemNo = assortment.baseAssortment?.itemNo || assortment.mergedData?.assortment?.itemNo || '';
      const name = assortment.baseAssortment?.name || assortment.mergedData?.assortment?.name || '';
      const customerItemNo = assortment.baseAssortment?.customerItemNo || assortment.mergedData?.assortment?.customerItemNo || '';
      
      const searchLower = searchTerm.toLowerCase();
      
      return itemNo.toLowerCase().includes(searchLower) ||
             name.toLowerCase().includes(searchLower) ||
             customerItemNo.toLowerCase().includes(searchLower);
    });
  }, [salesOrderData?.assortments, searchTerm]);

  // Pagination logic
  const viewStyle = params.view_style || 'list';
  const itemsPerPage = params.per_page || 10;
  const currentPage = params.page || 1;
  const totalPages = Math.ceil(filteredAssortments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedAssortments = filteredAssortments.slice(startIndex, startIndex + itemsPerPage);

  // Mock pagination props for compatibility
  const paginationProps = {
    pageCount: totalPages,
    hasNextPage: currentPage < totalPages,
    hasPreviousPage: currentPage > 1,
  };

  // Transform assortments for table display - FIXED to handle AssortmentData structure
  const tableData: AssortmentRowData[] = paginatedAssortments.map((assortment: AssortmentData) => {
    const baseAssortment = assortment.baseAssortment || {};
    const mergedAssortment = assortment.mergedData?.assortment || {};
    
    return {
      _id: baseAssortment._id || mergedAssortment._id || '',
      itemNo: baseAssortment.itemNo || mergedAssortment.itemNo || '',
      name: baseAssortment.name || mergedAssortment.name || '',
      customerItemNo: baseAssortment.customerItemNo || mergedAssortment.customerItemNo || '',
      status: baseAssortment.status || mergedAssortment.status || 'pending',
      imageCount: assortment.mergedData?.combinedImageCount || 0,
      webhookImageCount: assortment.mergedData?.combinedImageCount || 0, // Required by table type
      length_cm: baseAssortment.length_cm || mergedAssortment.length_cm || 0,
      width_cm: baseAssortment.width_cm || mergedAssortment.width_cm || 0,
      height_cm: baseAssortment.height_cm || mergedAssortment.height_cm || 0,
      master_carton_length_cm: baseAssortment.master_carton_length_cm || mergedAssortment.master_carton_length_cm || 0,
      master_carton_width_cm: baseAssortment.master_carton_width_cm || mergedAssortment.master_carton_width_cm || 0,
      master_carton_height_cm: baseAssortment.master_carton_height_cm || mergedAssortment.master_carton_height_cm || 0,
      inner_carton_length_cm: baseAssortment.inner_carton_length_cm || mergedAssortment.inner_carton_length_cm || 0,
      inner_carton_width_cm: baseAssortment.inner_carton_width_cm || mergedAssortment.inner_carton_width_cm || 0,
      inner_carton_height_cm: baseAssortment.inner_carton_height_cm || mergedAssortment.inner_carton_height_cm || 0,
      // Include the webhook images
      pcfImages: baseAssortment.webhookImages || mergedAssortment.pcfImages || {
        itemPackImages: [],
        itemBarcodeImages: [],
        displayImages: [],
        innerCartonImages: [],
        masterCartonImages: [],
      },
    };
  });

  return (
    <div className="w-auto">
      <div className="mb-4 flex align-items-center justify-end gap-4">
        <div className="col-2">
          <FilterInput
            placeholder={t('keyPlaceholder_search')}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setParams({ page: 1 }); // Reset to first page when searching
            }}
          />
        </div>
        <ViewStyleButton />
      </div>

      <div className="flex items-center gap-12 py-4 text-blue-600 font-bold underline">
        <div className="flex items-center cursor-pointer hover:text-blue-800">
          <Icons.ShareO1 width={16} height={16} />
          <span className="ml-2">{t(`keyButton_download.allPdf`)}</span>
        </div>
        <div className="flex items-center cursor-pointer hover:text-blue-800">
          <Icons.ShareO1 width={16} height={16} />
          <span className="ml-2">{t(`keyButton_download.allExcel`)}</span>
        </div>
      </div>

      <div id="packing-instructions">
        <ConditionalShell condition={viewStyle === 'grid'}>
          <PackingInstructionGridView
            items={filteredAssortments}
            salesOrderId={salesOrderId}
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            paginationProps={paginationProps}
            searchParams={{ params, setParams }}
          />
        </ConditionalShell>

        <ConditionalShell condition={viewStyle === 'list'}>
          <DataTable
            data={tableData}
            enableToolbar={false}
            enablePagination={false}
            columns={packingInstructionTableColumns}
            isLoading={false}
            pagination={{
              pageIndex: currentPage - 1,
              pageSize: itemsPerPage,
            }}
            customPagination={
              <PackingInstructionTablePagination
                searchParams={{ params, setParams }}
                pageCount={totalPages}
                hasNextPage={paginationProps.hasNextPage}
                hasPreviousPage={paginationProps.hasPreviousPage}
                totalItems={filteredAssortments.length}
                currentPage={currentPage}
                itemsPerPage={itemsPerPage}
              />
            }
          />
        </ConditionalShell>
      </div>
    </div>
  );
}

// Grid/List view item types for data table
export interface PackingInstructionGridProps {
  items: AssortmentData[]; // FIXED: Updated type to AssortmentData[]
  salesOrderId: string;
  currentPage: number;
  itemsPerPage: number;
  paginationProps: {
    pageCount: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  searchParams: {
    params: any;
    setParams: (newParams: any) => void;
  };
}

// Helper function to transform AssortmentData to PackingInstructionCard format
function transformAssortmentDataForCard(assortmentData: AssortmentData) {
  const baseAssortment = assortmentData.baseAssortment || {};
  const mergedAssortment = assortmentData.mergedData?.assortment || {};
  const webhookImages = assortmentData.baseAssortment?.webhookImages || assortmentData.mergedData?.webhookImages;
  
  return {
    _id: baseAssortment._id || mergedAssortment._id || '',
    customerItemNo: baseAssortment.customerItemNo || '',
    itemNo: baseAssortment.itemNo || mergedAssortment.itemNo || '',
    name: baseAssortment.name || mergedAssortment.name || '',
    status: baseAssortment.status || mergedAssortment.status || 'pending',
    image: undefined, // We'll extract this from webhookImages if available
    webhookImageCount: assortmentData.mergedData?.combinedImageCount || 0,
    dimensions: {
      length_cm: baseAssortment.length_cm || mergedAssortment.length_cm || 0,
      width_cm: baseAssortment.width_cm || mergedAssortment.width_cm || 0,
      height_cm: baseAssortment.height_cm || mergedAssortment.height_cm || 0,
    },
    webhookImages: webhookImages || {
      itemPackImages: [],
      itemBarcodeImages: [],
      displayImages: [],
      innerCartonImages: [],
      masterCartonImages: [],
    },
    pcfImages: mergedAssortment.pcfImages || webhookImages,
  };
}

function PackingInstructionGridView({
  items,
  salesOrderId,
  currentPage,
  itemsPerPage,
  paginationProps,
  searchParams
}: PackingInstructionGridProps) {
  // Get items for current page
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedItems = items.slice(startIndex, startIndex + itemsPerPage);

  return (
    <>
      <div className="mx-n4 px-4 mx-lg-n6 px-lg-6 position-relative top-1 products-grid-container pb-5">
        {paginatedItems.map((item) => (
          <PackingInstructionCard
            key={item.baseAssortment?._id || item.mergedData?.assortment?._id}
            assortment={transformAssortmentDataForCard(item)}
            salesOrderId={salesOrderId}
          />
        ))}
      </div>

      {/* Grid pagination */}
      <div className="w-100 d-flex justify-content-center">
        <PackingInstructionTablePagination
          searchParams={searchParams}
          pageCount={paginationProps.pageCount}
          hasNextPage={paginationProps.hasNextPage}
          hasPreviousPage={paginationProps.hasPreviousPage}
          totalItems={items.length}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
        />
      </div>
    </>
  );
}