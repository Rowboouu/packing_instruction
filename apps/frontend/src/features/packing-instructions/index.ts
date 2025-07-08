// @/features/packing-instructions/index.ts

// Export API hooks and functions
export * from './api/getSalesOrder';
export * from './api/getAssortment';
export * from './api/updateAssortment';
export * from './api/uploadImages';

// Explicit re-exports from saveIndividualAssortment to avoid conflicts
export {
  saveIndividualAssortment,
  useSaveIndividualAssortment,
  type SaveIndividualAssortmentDTO,
  type SaveIndividualAssortmentResponse
} from './api/saveIndividualAssortment';

// Export types (these no longer include the conflicting DTOs)
export * from './types';

// Export components
export { PackingInstructionHeader } from './components/packing-instruction-header';
export { PackingInstructionItem } from './components/packing-instruction-item';
export { PackingInstructionCard } from './components/packing-instruction-card';
export { PackingInstructionDataView } from './components/packing-instruction-data-view';

// Export routes
export { PackingInstructionOverview } from './routes/packing-instruction-overview';
export { PackingInstructionView } from './routes/packing-instruction-view';