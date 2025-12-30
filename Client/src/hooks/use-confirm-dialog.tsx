import { useState, useCallback } from "react";

//会话确认对话框hook
interface UseConfirmDialogReturn<T> {
  open: boolean;
  context: T | null;
  onOpenDialog: (data: T) => void;
  onCloseDialog: () => void;
}

const useConfirmDialog = <T,>(): UseConfirmDialogReturn<T> => {
  const [open, setOpen] = useState(false);
  const [context, setContext] = useState<T | null>(null);

  //打开对话框
  const onOpenDialog = useCallback((data: T) => {
    setContext(data);
    setOpen(true);
  }, []);

  //关闭对话框
  const onCloseDialog = useCallback(() => {
    setOpen(false);
    setContext(null);
  }, []);

  return { open, context, onOpenDialog, onCloseDialog };
};

export default useConfirmDialog;