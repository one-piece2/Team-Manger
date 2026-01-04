import { useCallback } from "react";
import { Loader } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { logoutMutationFn } from "@/lib/api";
import { useNavigate } from "react-router-dom";
import { useStore } from "@/store/store";

const LogoutDialog = (props: {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const { isOpen, setIsOpen } = props;

  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { clearUser, clearAccessToken } = useStore();

  const { mutate, isPending } = useMutation({
    mutationFn: logoutMutationFn,
    onSuccess: () => {
    //清除react-query缓存
      queryClient.resetQueries({
        queryKey: ["authUser"],
      });
      // 清除 Zustand Store
      clearAccessToken();
      clearUser();
      navigate("/");
      setIsOpen(false); // Close dialog
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Handle logout action
  const handleLogout = useCallback(() => {
    if (isPending) return;
    mutate();
  }, [mutate, isPending]);
  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure you want to log out?</DialogTitle>
            <DialogDescription>
              This will end your current session and you will need to log in
              again to access your account.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" disabled={isPending} onClick={handleLogout}>
              {isPending && <Loader className="animate-spin" />}
              Sign out
            </Button>
            <Button type="button" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default LogoutDialog;
