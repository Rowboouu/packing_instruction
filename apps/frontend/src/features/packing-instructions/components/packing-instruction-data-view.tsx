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
import { SalesOrderData } from '../types';

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

  // Filter assortments based on search term
  const filteredAssortments = React.useMemo(() => {
    if (!salesOrderData?.assortments) return [];

    return salesOrderData.assortments.filter(assortment =>
      assortment.itemNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assortment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (assortment.customerItemNo || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
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

  // Transform assortments for table display
  const tableData = paginatedAssortments.map(assortment => ({
    ...assortment,
    imageCount: assortment.webhookImageCount, // Use the correct property
    status: assortment.status,
    length_cm: assortment.dimensions.length_cm,
    width_cm: assortment.dimensions.width_cm,
    height_cm: assortment.dimensions.height_cm,
  }));

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

interface PackingInstructionGridProps {
  items: SalesOrderData['assortments'];
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
            key={item._id}
            assortment={item}
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