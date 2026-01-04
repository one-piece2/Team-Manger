import { Dialog, DialogContent } from "@/components/ui/dialog";
import EditTaskForm from "./edit-task-form";
import {type TaskType } from "@/types/api.type";

interface EditTaskDialogProps {
  task: TaskType;
  isOpen: boolean;
  onClose: () => void;
}

const EditTaskDialog = ({ task, isOpen, onClose }: EditTaskDialogProps) => {
  return (
    <Dialog modal={true} open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-auto my-5 border-0">
        <EditTaskForm task={task} onClose={onClose} />
      </DialogContent>
    </Dialog>
  );
};

export default EditTaskDialog;