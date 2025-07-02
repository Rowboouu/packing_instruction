import { Assortment } from '@/features/assortments';
import { create } from 'zustand';

type SelectedAssortment = Assortment & { item_size: number };

type Store = {
  selected: SelectedAssortment[];
  resetSelection: () => void;
  toggleItemSelection: (item: SelectedAssortment) => void;
  addItemSize: (itemSize: { itemId: string; size: number }) => void;
  removeItem: (item: Assortment) => void;
};

export const useAttachmentStore = create<Store>((set) => ({
  selected: [],
  resetSelection: () => set({ selected: [] }),
  toggleItemSelection: (item) =>
    set((state) => {
      const isAlreadyChecked = state.selected.some((i) => i._id === item._id);

      if (isAlreadyChecked) {
        return {
          selected: state.selected.filter((i) => i._id !== item._id),
        };
      } else {
        return { selected: [...state.selected, item] };
      }
    }),
  addItemSize: (itemSize) =>
    set((state): Store | Partial<Store> => {
      const item = state.selected.find((i) => i._id === itemSize.itemId);
      if (item) {
        item.item_size = itemSize.size;
      }
      return state;
    }),
  removeItem: (item) =>
    set((state) => {
      return {
        selected: state.selected.filter((i) => i._id !== item._id),
      };
    }),
}));
