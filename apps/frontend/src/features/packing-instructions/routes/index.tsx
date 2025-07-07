// @/features/packing-instructions/routes/index.tsx

import { useParams } from 'react-router-dom';
import { AssortmentList } from '@/features/assortments/routes/assortment-overview';
import { AssortmentView } from '@/features/assortments/routes/assortment-view';

export function PackingInstructionPage() {
  const { identifier } = useParams<{ identifier: string }>();

  if (!identifier) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            No identifier provided
          </h2>
          <p className="text-gray-600">
            Please provide a valid sales order ID (SOP...) or assortment ID
            (A...)
          </p>
        </div>
      </div>
    );
  }

  if (identifier.startsWith('SOP')) {
    // Sales Order - show list of assortments for this sales order
    return <AssortmentList salesOrderId={identifier} />;
  } else if (identifier.startsWith('A')) {
    // Single Assortment - show PCF images page
    return <AssortmentView assortmentId={identifier} />;
  }

  return (
    <div className="flex items-center justify-center py-8">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Invalid identifier format
        </h2>
        <p className="text-gray-600">
          Identifier must start with 'SOP' for sales orders or 'A' for
          assortments
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Current identifier:{' '}
          <code className="bg-gray-100 px-2 py-1 rounded">{identifier}</code>
        </p>
      </div>
    </div>
  );
}
