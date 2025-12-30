import { create } from "zustand";

interface CreateProjectDialogState {
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
}

const useCreateProjectDialog = create<CreateProjectDialogState>((set) => ({
  open: false,
  onOpen: () => set({ open: true }),
  onClose: () => set({ open: false }),
}));

export default useCreateProjectDialog;