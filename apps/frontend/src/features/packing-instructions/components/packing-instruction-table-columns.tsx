import { ColumnDef } from '@tanstack/react-table';
import { useNavigate } from 'react-router-dom';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { useSaveIndividualAssortment } from '../api/saveIndividualAssortment';

interface AssortmentRowData {
  _id: string;
  customerItemNo?: string;
  itemNo: string;
  name: string;
  length_cm: number;
  width_cm: number;
  height_cm: number;
  imageCount: number;
  status: string;
  webhookImageCount: number;
}

// Create a wrapper component for the clickable cell to use hooks
function ClickableItemNoCell({ row }: { row: any }) {
  const navigate = useNavigate();
  const { mutate: saveForStandalone } = useSaveIndividualAssortment({
    showToast: false,
  });

  const itemNo = row.getValue('itemNo') as string;
  const original = row.original;

  const handleClick = async () => {
    console.log(`🔄 Navigating to assortment: ${itemNo}`);
    
    // Save individual assortment in background
    try {
      saveForStandalone({
        assortment: original,
        sourceOrderName: 'CURRENT_SALES_ORDER', // You might need to pass this down as context
      });
      console.log(`💾 Started background save for individual assortment data`);
    } catch (error) {
      console.error(`❌ Error saving individual assortment data:`, error);
    }

    // Navigate with data
    navigate(`/packing-instruction/${itemNo}`, {
      state: { 
        assortmentData: original,
        fromTable: true 
      }
    });
  };

  return (
    <div 
      className="px-2 font-bold text-blue-600 cursor-pointer hover:text-blue-800"
      onClick={handleClick}
    >
      {itemNo}
    </div>
  );
}

export const packingInstructionTableColumns: ColumnDef<AssortmentRowData>[] = [
  {
    accessorKey: 'itemNo',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="ITEM NO." />
    ),
    cell: ({ row }) => <ClickableItemNoCell row={row} />,
  },
  {
    accessorKey: 'customerItemNo',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="CUSTOMER ITEM NO." />
    ),
    cell: ({ row }) => {
      const customerItemNo = row.getValue('customerItemNo') as string;
      return <div className="px-2">{customerItemNo || '-'}</div>;
    },
  },
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="DESCRIPTION" />
    ),
    cell: ({ row }) => {
      const name = row.getValue('name') as string;
      return (
        <div className="px-2 max-w-xs" title={name}>
          {name}
        </div>
      );
    },
  },
  {
    accessorKey: 'dimensions',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="DIMENSIONS (L×W×H)" />
    ),
    cell: ({ row }) => {
      const { length_cm, width_cm, height_cm } = row.original;
      return (
        <div className="px-2 text-sm">
          {length_cm} × {width_cm} × {height_cm} cm
        </div>
      );
    },
  },
  {
    accessorKey: 'imageCount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="IMAGES" />
    ),
    cell: ({ row }) => {
      const imageCount = row.getValue('imageCount') as number;
      const hasImages = imageCount > 0;
      
      return (
        <div className="px-2">
          {hasImages ? (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              {imageCount} images
            </span>
          ) : (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              No images
            </span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="STATUS" />
    ),
    cell: ({ row }) => {
      const status = row.getValue('status') as string;
      return (
        <div className="px-2">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            {status}
          </span>
        </div>
      );
    },
  },
];