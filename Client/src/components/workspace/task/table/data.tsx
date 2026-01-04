import { TaskPriorityEnum, TaskStatusEnum } from "@/constant";
import { transformOptions } from "@/lib/helper";
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  CheckCircle,
  Circle,
  HelpCircle,
  Timer,
  View,
} from "lucide-react";

//任务状态图标映射
const statusIcons = {
  [TaskStatusEnum.BACKLOG]: HelpCircle,
  [TaskStatusEnum.TODO]: Circle,
  [TaskStatusEnum.IN_PROGRESS]: Timer,
  [TaskStatusEnum.IN_REVIEW]: View,
  [TaskStatusEnum.DONE]: CheckCircle,
};
//任务优先级图标映射
const priorityIcons = {
  [TaskPriorityEnum.LOW]: ArrowDown,
  [TaskPriorityEnum.MEDIUM]: ArrowRight,
  [TaskPriorityEnum.HIGH]: ArrowUp,
};
//任务状态转换为下拉选项
export const statuses = transformOptions(
  Object.values(TaskStatusEnum),
  statusIcons
);

//任务优先级转换为下拉选项
export const priorities = transformOptions(
  Object.values(TaskPriorityEnum),
  priorityIcons
);
