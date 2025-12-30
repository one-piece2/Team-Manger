import { create } from "zustand";

interface CreateWorkspaceDialogState {
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
}

const useCreateWorkspaceDialog = create<CreateWorkspaceDialogState>((set) => ({
  open: false,
  onOpen: () => set({ open: true }),
  onClose: () => set({ open: false }),
}));

export default useCreateWorkspaceDialog;