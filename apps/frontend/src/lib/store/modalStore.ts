import { ModalProps } from 'react-bootstrap';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface ModalSection {
  title?: React.ReactNode;
  body?: React.ReactNode;
  footer?: React.ReactNode;
}

interface ModalStore {
  component?: ModalSection;
  option?: ModalProps;
}

interface ModalStoreActions {
  setModal: (state: ModalStore) => void;
  closeModal: () => void;
}

const intitialState: ModalStore = {
  component: undefined,
  option: undefined,
};

export const useModalStore = create<ModalStore & ModalStoreActions>()(
  devtools((set, get) => ({
    ...intitialState,
    setModal: (state) => set(() => ({ ...get(), ...state })),
    closeModal: () => set(() => ({ ...get(), ...intitialState })),
  })),
);
