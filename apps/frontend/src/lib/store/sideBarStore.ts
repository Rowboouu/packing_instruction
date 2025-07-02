import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface SideBarStore {
  isSideBarCollapse: boolean;
  isSideBarShow: boolean;
  toggleSideBar: () => void;
  toggleSideBarShow: (state?: boolean) => void;
}

export const useSideBarStore = create<SideBarStore>()(
  devtools(
    persist(
      (set) => ({
        isSideBarCollapse: false,
        isSideBarShow: false,
        toggleSideBar: () =>
          set((state) => ({
            ...state,
            isSideBarCollapse: !state.isSideBarCollapse,
          })),
        toggleSideBarShow: () =>
          set((state) => ({
            ...state,
            isSideBarShow: !state.isSideBarShow,
          })),
      }),
      {
        name: 'pack-center-ui-state',
      },
    ),
  ),
);
