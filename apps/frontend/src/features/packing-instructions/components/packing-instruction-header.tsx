import PageHeader from '@/components/page-header';

// Accept either AssortmentPCF or baseAssortment structure
interface PackingInstructionHeaderProps {
  assortment?: {
    itemNo?: string;
    name?: string;
    customerItemNo?: string | null; // Allow both null and undefined
  };
  isLoading?: boolean;
  dataSource?: 'webhook' | 'traditional' | 'navigation';
}

export function PackingInstructionHeader({
  assortment,
  isLoading,
  dataSource,
}: PackingInstructionHeaderProps) {
  
  return (
    <PageHeader isLoading={isLoading}>
      <div className="flex align-items-center">
        {assortment?.itemNo ? `${assortment.itemNo} - ${assortment.name || 'Loading...'}` : 'Loading assortment...'}
        {/* Show data source in development */}
        {process.env.NODE_ENV === 'development' && dataSource && (
          <span className="ml-4 text-xs text-blue-500">
            Data: {dataSource === 'navigation' ? '⚡ Navigation (fast)' : 
                   dataSource === 'webhook' ? '🔄 Webhook API' : 
                   '📊 Traditional API'}
          </span>
        )}
      </div>
    </PageHeader>
  );
}